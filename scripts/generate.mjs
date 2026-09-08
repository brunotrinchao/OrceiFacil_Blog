import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { v2 as cloudinary } from 'cloudinary'
import { validatePost } from './validate.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar .env local se existir
const envPath = path.join(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ''
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
      if (!process.env[key]) process.env[key] = value.trim()
    }
  }
}

const POSTS_DIR = path.join(__dirname, '../content/posts')
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/images/posts')
const TOPICS_FILE = path.join(__dirname, '../content/topics.json')

// Variáveis de ambiente
const apiKey = process.env.GEMINI_API_KEY
const modelName = process.env.MODEL || 'gemini-2.5-flash'
const postsPerDay = parseInt(process.env.POSTS_PER_DAY || '3', 10)
const timezone = process.env.TIMEZONE || 'America/Sao_Paulo'

// Cloudinary
const cloudinaryCloudName = process.env.CLOUDINARY_NAME || process.env.NUXT_CLOUDINARY_CLOUD_NAME
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET
const hasCloudinary = Boolean(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret)

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true
  })
}

if (!apiKey) {
  console.log('⚠️ GEMINI_API_KEY não configurada. Pulando geração de posts.')
  process.exit(0)
}

const genAI = new GoogleGenerativeAI(apiKey)

// Obter data de hoje no fuso horário BRT
function getTodayDateString() {
  const options = { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }
  const formatter = new Intl.DateTimeFormat('en-CA', options)
  return formatter.format(new Date())
}

// Parsing ultra-resiliente de JSON
function safeParseJson(rawText) {
  let cleaned = rawText.trim()
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    try {
      // Tenta corrigir caracteres de controle não escapados
      const sanitized = cleaned.replace(/[\u0000-\u001F]+/g, (match) => {
        if (match === '\n') return '\\n'
        if (match === '\r') return '\\r'
        if (match === '\t') return '\\t'
        return ''
      })
      return JSON.parse(sanitized)
    } catch (e2) {
      try {
        // Tentativa de fix em aspas duplas internas no "content"
        const contentIdx = cleaned.indexOf('"content"')
        if (contentIdx !== -1) {
          const startVal = cleaned.indexOf('"', contentIdx + 9)
          if (startVal !== -1) {
            const endVal = cleaned.lastIndexOf('"')
            if (endVal > startVal) {
              const prefix = cleaned.slice(0, startVal + 1)
              const suffix = cleaned.slice(endVal)
              let inner = cleaned.slice(startVal + 1, endVal)
              // Escapar aspas internas e quebras de linha cruas
              inner = inner.replace(/\\"/g, '___ESCAPED_QUOTE___')
                .replace(/"/g, '\\"')
                .replace(/___ESCAPED_QUOTE___/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t')
              const fixedJson = prefix + inner + suffix
              return JSON.parse(fixedJson)
            }
          }
        }
      } catch (e3) {}

      try {
        const extractField = (key) => {
          const m = cleaned.match(new RegExp(`"${key}"\\s*:\\s*"([^]*?)"\\s*(?:,|})`))
          return m ? m[1] : null
        }

        const title = extractField('title')
        const description = extractField('description')
        const slug = extractField('slug')
        const category = extractField('category')
        const categorySlug = extractField('categorySlug')
        const readTime = extractField('readTime')

        const contentMatch = cleaned.match(/"content"\s*:\s*"([^]*)"\s*}\s*$/)
        const content = contentMatch ? contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : null

        if (title && description && content) {
          return {
            title,
            description,
            slug: slug || 'artigo',
            category: category || 'Geral',
            categorySlug: categorySlug || 'geral',
            tags: ["Orçamento", "Serviços"],
            keywords: ["orcamento", "prestador de serviço"],
            readTime: readTime || '6 min de leitura',
            faq: [],
            content
          }
        }
      } catch (e4) {}

      // Fallback por REGEX agressivo (CLOUDFLARE_FALLBACK_REGEX)
      try {
        const extractString = (key) => {
          const m = cleaned.match(new RegExp(`"${key}"\\s*:\\s*"([^]*?)"\\s*(?:,|"\\w+"\\s*:|\\})`))
          return m ? m[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '').trim() : null
        }

        const title = extractString('title') || cleaned.match(/#\s*(.+)/)?.[1]
        const description = extractString('description') || title
        const imagePrompt = extractString('imagePrompt')
        const slug = extractString('slug')
        
        let content = ''
        const contentMatch = cleaned.match(/"content"\s*:\s*"([^]*)"\s*}\s*$/) || cleaned.match(/"content"\s*:\s*"([^]*)"\s*(?:,\s*"|\s*}\s*$)/)
        if (contentMatch) {
          content = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim()
        } else {
          const contentStart = cleaned.indexOf('"content"')
          if (contentStart !== -1) {
            const firstQuote = cleaned.indexOf('"', contentStart + 9)
            if (firstQuote !== -1) {
              content = cleaned.slice(firstQuote + 1).replace(/"\s*}\s*$/, '').replace(/\\n/g, '\n').replace(/\\"/g, '"').trim()
            }
          }
        }

        // Limpa resíduos de JSON se o content contiver o cabeçalho bruto {"title": ...}
        if (content.startsWith('{') || content.includes('"description":')) {
          content = content.replace(/^\{[^]*?"content"\s*:\s*"/, '')
            .replace(/^"title"\s*:\s*"[^"]*",?/gm, '')
            .replace(/^"description"\s*:\s*"[^"]*",?/gm, '')
            .replace(/^"slug"\s*:\s*"[^"]*",?/gm, '')
            .replace(/^"category"\s*:\s*"[^"]*",?/gm, '')
            .replace(/^"categorySlug"\s*:\s*"[^"]*",?/gm, '')
            .replace(/^"imagePrompt"\s*:\s*"[^"]*",?/gm, '')
            .replace(/^"tags"\s*:\s*\[[^\]]*\],?/gm, '')
            .replace(/^"keywords"\s*:\s*\[[^\]]*\],?/gm, '')
            .replace(/^"readTime"\s*:\s*"[^"]*",?/gm, '')
            .replace(/"\s*}\s*$/, '')
            .trim()
        }

        const cleanTitle = (title || 'Artigo de Orçamento').replace(/^#\s*/, '').replace(/"/g, '').trim()

        if (!content || content.startsWith('{')) {
          content = `# ${cleanTitle}\n\n${description || ''}\n\nElaborar um orçamento detalhado e transparente é fundamental para conquistar a confiança dos clientes e garantir a rentabilidade dos seus serviços no mercado atual.\n\nPara otimizar suas propostas comerciais, economizar tempo e fechar mais vendas, **visite https://orceifacil.com.br**.`
        }

        return {
          title: cleanTitle,
          description: (description || cleanTitle).replace(/"/g, '').trim(),
          slug: slug ? slug.replace(/"/g, '') : cleanTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '-'),
          category: extractString('category') || 'Geral',
          categorySlug: extractString('categorySlug') || 'geral',
          imagePrompt: imagePrompt || '',
          tags: ["Orçamento", "Serviços"],
          keywords: ["orcamento", "prestador de serviço"],
          readTime: '6 min de leitura',
          faq: [],
          content
        }
      } catch (eRegex) {}

      throw new Error(`Bad JSON format: ${err.message}`)
    }
  }
}

// Gerador/Download de Fotografia Real HD (Unsplash) + Upload para Cloudinary ($0 custo)
async function generateCoverImage(slug, category, title, customImagePrompt, topicItem) {
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true })
  }

  const filename = `${slug}.jpg`
  const filePath = path.join(PUBLIC_IMAGES_DIR, filename)
  const relativeUrl = `/images/posts/${filename}`

  // Mapeamento de fotografias reais HD por categoria
  const photoPools = {
    eletrica: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    hidraulica: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    pintura: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    reformas: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    vendas: [
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    climatizacao: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    marcenaria: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    serralheria: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    'gesso': [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    'limpeza': [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    'seguranca': [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&h=675&q=80'
    ],
    'juridico': [
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&h=675&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=675&q=80'
    ]
  }

  const fallbackPool = [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=675&q=80'
  ]

  const getHash = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  const slugHash = getHash(slug)

  // Algoritmo de análise inteligente de tópico e categoria para seleção de imagem
  const normText = normalizeStr(`${category || ''} ${topicItem || ''} ${title || ''} ${customImagePrompt || ''}`)

  // Mapeamento de palavras-chave do tópico para a categoria real da foto
  const topicKeywordMap = [
    { key: 'hidraulica', keywords: ['hidraulica', 'vazamento', 'tubulacao', 'prumada', 'loucas', 'metais', 'cano', 'encanador', 'caixadagua', 'esgoto', 'pia', 'torneira'] },
    { key: 'eletrica', keywords: ['eletrica', 'eletrico', 'tomada', 'iluminacao', 'padrao', 'bifasico', 'trifasico', 'disjuntor', 'fios', 'quadro', 'fio', 'redeeletrica'] },
    { key: 'pintura', keywords: ['pintura', 'pintor', 'tinta', 'massacorrida', 'parede', 'verniz', 'acabamento', 'lixamento', 'esmalte'] },
    { key: 'climatizacao', keywords: ['climatizacao', 'arcondicionado', 'pmoc', 'btus', 'higienizacao', 'refrigeracao', 'split'] },
    { key: 'marcenaria', keywords: ['marcenaria', 'marceneiro', 'mdf', 'moveis', 'montagem', 'desmontagem', 'chapas', 'ferragens', 'planejados'] },
    { key: 'serralheria', keywords: ['serralheria', 'serralheiro', 'portao', 'gradil', 'solda', 'aco', 'coberturametalia', 'ferro'] },
    { key: 'gesso', keywords: ['gesso', 'drywall', 'sanca', 'cortineiro', 'forro', 'rebaixado', 'acartonado'] },
    { key: 'limpeza', keywords: ['limpeza', 'posobra', 'diarista', 'produtosquimicos', 'faxina', 'higienizacao'] },
    { key: 'seguranca', keywords: ['seguranca', 'cftv', 'camera', 'interfonia', 'controledeacesso', 'alarme', 'telecom', 'rede'] },
    { key: 'vendas', keywords: ['vendas', 'whatsapp', 'proposta', 'pdf', 'desconto', 'cliente', 'preco', 'comercial', 'fechar'] },
    { key: 'juridico', keywords: ['juridico', 'contrato', 'garantia', 'lei', 'termo', 'vistoria', 'juridica', 'advogado'] },
    { key: 'reformas', keywords: ['reforma', 'obra', 'pedreiro', 'empreiteiro', 'entulho', 'alvenaria', 'piso', 'azulejo', 'construcao'] }
  ]

  let detectedCategory = null
  for (const item of topicKeywordMap) {
    if (item.keywords.some(kw => normText.includes(kw))) {
      detectedCategory = item.key
      break
    }
  }

  const selectedCategory = detectedCategory || 'reformas'
  const photos = photoPools[selectedCategory] || fallbackPool
  const selectedUrl = photos[slugHash % photos.length]

  try {
    console.log(`📷 Baixando fotografia real HD (Unsplash) para: "${title}"...`)
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(selectedUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer())
      fs.writeFileSync(filePath, buffer)

      if (hasCloudinary) {
        console.log(`☁️ Enviando fotografia HD para o Cloudinary (production/orcei-facil/blog/${slug})...`)
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'production/orcei-facil/blog',
              public_id: slug,
              overwrite: true,
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          uploadStream.end(buffer)
        })

        console.log(`✅ Fotografia HD salva no Cloudinary: ${uploadResult.secure_url}`)
        return uploadResult.secure_url
      }

      console.log(`✅ Fotografia HD salva localmente em: public/images/posts/${filename}`)
      return relativeUrl
    }
  } catch (err) {
    console.warn(`⚠️ Não foi possível baixar/enviar a fotografia para "${slug}":`, err.message)
  }

  return 'https://orceifacil.com.br/images/landpage-banner.jpg'
}

// Fallback para Cloudflare Workers AI quando o Gemini esgotar as 3 tentativas
async function generateWithCloudflare(topicItem, categoryInfo) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiKey = process.env.CLOUDFLARE_API_KEY
  const model = process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct'

  if (!accountId || !apiKey) {
    throw new Error('Credenciais da Cloudflare AI não encontradas no .env')
  }

  console.log(`⚡ Ativando FALLBACK para Cloudflare Workers AI (${model}) sobre: "${topicItem}"...`)

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`

  const cfPrompt = `Escreva um artigo completo de blog SEO em Português do Brasil (PT-BR) com mais de 1000 palavras sobre o tópico: "${topicItem}" na categoria "${categoryInfo.category}".

Estrutura Obrigatória em Markdown:
# [Título Atraente do Artigo de até 65 caracteres]

[Resumo introdutório completo de 2 parágrafos]

## O Que Considerar ao Fazer Este Orçamento
[Conteúdo detalhado com dicas práticas, fatores de preço e valores médios em R$]

## Tabela de Precificação e Mão de Obra
| Serviço / Etapa | Valor Médio (R$) | Prazo Estimado |
| :--- | :--- | :--- |
| Item 1 | R$ 150 - R$ 300 | 1 dia |
| Item 2 | R$ 250 - R$ 500 | 2 dias |

## Checklist Passo a Passo para o Profissional
- [ ] Realizar visita técnica no local
- [ ] Detalhar materiais e mão de obra no orçamento

## Dicas Comerciais para Fechar Mais Vendas
[Dicas práticas de vendas e como evitar prejuízo em propostas de serviços]

## Perguntas Frequentes (FAQ)
### Qual o valor médio deste serviço no Brasil?
[Resposta detalhada]

### Como calcular a mão de obra sem tomar prejuízo?
[Resposta detalhada]

### O que não pode faltar no orçamento?
[Resposta detalhada]

## Conclusão
[Conclusão reforçando a importância de enviar propostas profissionais. Inclua o link: Para criar orçamentos profissionais e fechar mais vendas, acesse https://orceifacil.com.br]`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'Você é um redator especialista em SEO, vendas e orçamentos para prestadores de serviço no Brasil. Escreva artigos completos e envolventes em formato Markdown.'
        },
        {
          role: 'user',
          content: cfPrompt
        }
      ],
      max_tokens: 3500
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Erro na API Cloudflare AI (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const mdText = data.result?.response || ''

  if (!mdText || mdText.length < 100) {
    throw new Error('Conteúdo gerado pela Cloudflare AI é muito curto ou inválido')
  }

  // Extrair campos do Markdown puro
  const titleMatch = mdText.match(/#\s*(.+)/)
  const title = titleMatch ? titleMatch[1].replace(/[\*#"]/g, '').trim() : topicItem
  
  const cleanBody = mdText.replace(/#\s*.+/, '')
  const descriptionMatch = cleanBody.match(/([^\n]+\.?)/)
  const description = descriptionMatch ? descriptionMatch[1].slice(0, 160).replace(/["\*]/g, '').trim() : title

  const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 60)

  // Extração das perguntas frequentes (FAQ)
  const faqList = []
  const faqMatches = mdText.matchAll(/###\s*(.+?\?)\n([^#]+)/g)
  for (const m of faqMatches) {
    if (m[1] && m[2]) {
      faqList.push({
        question: m[1].replace(/["\*]/g, '').trim(),
        answer: m[2].replace(/["\*]/g, '').trim()
      })
    }
  }

  if (faqList.length === 0) {
    faqList.push(
      { question: `Como fazer orçamento de ${categoryInfo.category.toLowerCase()}?`, answer: "Avalie todos os custos de materiais, tempo estimado de mão de obra e inclua uma margem de lucro justa." },
      { question: "O que incluir na proposta comercial?", answer: "Detalhamento dos serviços, prazos de execução, formas de pagamento e condições de garantia." }
    )
  }

  const imagePrompt = `professional 8k realistic photograph of a skilled Brazilian worker performing ${categoryInfo.category} service for ${topicItem}, sharp focus, modern tools, bright natural lighting, 35mm photography, masterpiece, no text`

  return {
    title,
    description,
    slug,
    category: categoryInfo.category,
    categorySlug: categoryInfo.categorySlug,
    imagePrompt,
    tags: [categoryInfo.category, "Orçamento", "Serviços"],
    keywords: [categoryInfo.category.toLowerCase(), "orcamento", "prestador de serviço"],
    readTime: "8 min de leitura",
    faq: faqList,
    content: mdText
  }
}

// Helper para normalizar strings para comparação de tópicos
function normalizeStr(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

// Ler posts existentes
function getExistingPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true })
    return []
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
  const posts = []

  for (const file of files) {
    const fullPath = path.join(POSTS_DIR, file)
    const content = fs.readFileSync(fullPath, 'utf8')
    
    const dateMatch = content.match(/date:\s*["']?([^"'\n]+)["']?/)
    const date = dateMatch ? dateMatch[1] : ''
    
    const slugMatch = content.match(/slug:\s*["']?([^"'\n]+)["']?/)
    const slugFromFile = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
    const slug = slugMatch ? slugMatch[1] : slugFromFile

    const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/)
    const title = titleMatch ? titleMatch[1] : file

    const topicMatch = content.match(/topic:\s*["']?([^"'\n]+)["']?/)
    const topic = topicMatch ? topicMatch[1] : ''

    posts.push({
      file,
      date,
      slug,
      title,
      topic
    })
  }

  return posts
}

// Verificar se um tópico já foi gerado
function isTopicAlreadyGenerated(topicItem, existingPosts) {
  const normTopic = normalizeStr(topicItem)

  return existingPosts.some(p => {
    const normPostTopic = normalizeStr(p.topic)
    const normTitle = normalizeStr(p.title)
    const normSlug = normalizeStr(p.slug)

    // Match exato do tópico
    if (normPostTopic && normPostTopic === normTopic) return true

    // Match se o tópico normalizado for igual ao título ou slug
    if (normTopic === normTitle || normTopic === normSlug) return true

    // Comparação de subpalavras significativas (se mais de 70% das palavras chave baterem)
    const topicWords = normTopic.match(/[a-z0-9]{4,}/g) || []
    if (topicWords.length >= 3) {
      const matchesInTitle = topicWords.filter(w => normTitle.includes(w) || normSlug.includes(w) || normPostTopic.includes(w))
      if (matchesInTitle.length / topicWords.length >= 0.7) {
        return true
      }
    }

    return false
  })
}

async function generateSinglePost(topicItem, categoryInfo, existingPosts) {
  const today = getTodayDateString()

  const existingSlugs = existingPosts.map(p => p.slug)
  const existingTitles = existingPosts.slice(0, 10).map(p => `- ${p.title} (/blog/${p.slug})`).join('\n')

  const prompt = `Você é um redator SEO especialista em mercado de prestação de serviços, orçamentos e pequenas empresas no Brasil.
Escreva um artigo completo, prático e altamente indexável em Português do Brasil (PT-BR) sobre o tópico: "${topicItem}" na categoria "${categoryInfo.category}".

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem tags markdown em volta).
IMPORTANTE: 
1. No campo "content", use "\\n" para quebras de linha.
2. Não use aspas duplas soltas dentro dos textos do "content". Use aspas simples (') ou aspas escapadas (\\").
3. No campo "imagePrompt", forneça uma descrição detalhada e fotorrealista em INGLÊS para gerar a capa do artigo no DALL-E/Midjourney (ex: "Professional photo of... 4k photography, bright natural light, no text").

Formato JSON esperado:
{
  "title": "Título atrativo até 65 caracteres",
  "description": "Descrição envolvente de 120 a 160 caracteres",
  "slug": "slug-kebab-sem-acentos",
  "category": "${categoryInfo.category}",
  "categorySlug": "${categoryInfo.categorySlug}",
  "imagePrompt": "Detailed photographic prompt in English representing this specific topic, 4k ultra realistic, cinematic lighting, no text",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "keywords": ["palavra-chave 1", "palavra-chave 2"],
  "readTime": "6 min de leitura",
  "faq": [
    { "question": "Pergunta 1?", "answer": "Resposta detalhada 1." },
    { "question": "Pergunta 2?", "answer": "Resposta detalhada 2." },
    { "question": "Pergunta 3?", "answer": "Resposta detalhada 3." }
  ],
  "content": "Conteúdo completo em Markdown com mais de 1000 palavras, cabeçalhos H2 (##) e H3 (###), valores R$, checklists e 2 CTAs para https://orceifacil.com.br"
}

Links Internos Disponíveis para Citar (se relevante):
${existingTitles}`

  console.log(`🤖 Solicitando artigo ao Gemini (${modelName}): "${topicItem}"...`)

  let rawText = ''
  let attempts = 0
  const maxAttempts = 3
  let geminiSuccess = false

  while (attempts < maxAttempts) {
    attempts++
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      })

      const result = await model.generateContent(prompt)
      const response = await result.response
      rawText = response.text()
      geminiSuccess = true
      break
    } catch (err) {
      const is503 = err.message?.includes('503') || err.message?.includes('high demand') || err.status === 503
      const is429 = err.message?.includes('429') || err.message?.includes('Quota exceeded') || err.status === 429

      if ((is503 || is429) && attempts < maxAttempts) {
        const waitTime = is429 ? 12000 : 6000
        console.warn(`⚠️ Gemini ${is429 ? '429 (Rate Limit)' : '503 (Alta Demanda)'}. Tentativa ${attempts}/${maxAttempts}. Aguardando ${waitTime / 1000}s...`)
        await new Promise(r => setTimeout(r, waitTime))
      } else {
        console.warn(`⚠️ Gemini falhou na tentativa ${attempts} (${err.message})...`)
        if (attempts >= maxAttempts) break
      }
    }
  }

  let postData
  if (!geminiSuccess) {
    console.log(`🚀 Executando fallback: Cloudflare Workers AI (${process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct'})...`)
    postData = await generateWithCloudflare(topicItem, categoryInfo)
  } else {
    postData = safeParseJson(rawText)
  }

  // Guardar tópico original
  postData.topic = topicItem

  // Garantir slugs e categorias consistentes
  postData.category = categoryInfo.category
  postData.categorySlug = categoryInfo.categorySlug
  postData.slug = (postData.slug || 'post').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '-')

  // Gerar imagem temática por IA na criação do post
  const coverImagePath = await generateCoverImage(postData.slug, postData.category, postData.title, postData.imagePrompt, topicItem)
  postData.image = coverImagePath

  // Validação
  const validation = validatePost(postData, existingSlugs)
  if (!validation.isValid) {
    console.warn(`⚠️ Alertas de validação para o post "${postData.title}":`, validation.errors)
  }

  // Remover seção repetida do FAQ no corpo do texto (pois será renderizada exclusivamente pelo FaqAccordion)
  const cleanBodyContent = postData.content
    .replace(/##\s*Perguntas\s+Frequentes\s*\(FAQ\)[^]*?(?=(##\s*(?:Conclusão|Conclusao)|$))/i, '')
    .trim()

  // Montar arquivo Markdown com campo topic e image
  const markdownContent = `---
title: "${postData.title.replace(/"/g, '\\"')}"
description: "${postData.description.replace(/"/g, '\\"')}"
topic: "${postData.topic.replace(/"/g, '\\"')}"
slug: "${postData.slug}"
date: "${today}"
category: "${postData.category}"
categorySlug: "${postData.categorySlug}"
image: "${postData.image}"
tags: ${JSON.stringify(postData.tags || [])}
keywords: ${JSON.stringify(postData.keywords || [])}
readTime: "${postData.readTime || '6 min de leitura'}"
author:
  name: "Redação Orcei Fácil"
  role: "Especialistas em Orçamentos e Vendas"
  avatar: "https://orceifacil.com.br/images/favicon/favicon-96x96.png"
faq:
${(postData.faq || []).map(f => `  - question: ${JSON.stringify(f.question)}\n    answer: ${JSON.stringify(f.answer)}`).join('\n')}
---

${cleanBodyContent}
`

  const filename = `${today}-${postData.slug}.md`
  const filePath = path.join(POSTS_DIR, filename)

  fs.writeFileSync(filePath, markdownContent, 'utf8')
  console.log(`✅ Post e imagem salvos com sucesso: content/posts/${filename}`)
}

async function main() {
  const today = getTodayDateString()
  const existingPosts = getExistingPosts()

  // Guard de idempotência
  const postsToday = existingPosts.filter(p => p.date === today)
  console.log(`📅 Data de hoje (BRT): ${today}. Posts gerados hoje até agora: ${postsToday.length}/${postsPerDay}`)

  if (postsToday.length >= postsPerDay) {
    console.log(`✨ Meta de ${postsPerDay} posts para o dia ${today} já foi alcançada. [skip]`)
    process.exit(0)
  }

  if (!fs.existsSync(TOPICS_FILE)) {
    console.error('❌ Arquivo content/topics.json não encontrado.')
    process.exit(1)
  }

  const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'))
  const postsToGenerate = postsPerDay - postsToday.length

  // Coletar todos os tópicos elegíveis que ainda não foram gerados
  const candidateTopics = []

  for (const cat of topicsData) {
    const categorySlug = cat.categorySlug || cat.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '-')
    
    for (const topic of cat.topics) {
      if (!isTopicAlreadyGenerated(topic, existingPosts)) {
        candidateTopics.push({
          topic,
          categoryInfo: {
            category: cat.category,
            categorySlug
          }
        })
      }
    }
  }

  if (candidateTopics.length === 0) {
    console.log('🎉 Todos os tópicos da lista content/topics.json já foram gerados!')
    process.exit(0)
  }

  // Embaralhamento aleatório (Fisher-Yates Shuffle)
  for (let i = candidateTopics.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidateTopics[i], candidateTopics[j]] = [candidateTopics[j], candidateTopics[i]]
  }

  console.log(`🎲 Tópicos disponíveis não-gerados: ${candidateTopics.length}. Selecionando ${postsToGenerate} aleatoriamente...`)

  let generatedCount = 0
  for (const item of candidateTopics) {
    if (generatedCount >= postsToGenerate) break

    try {
      await generateSinglePost(item.topic, item.categoryInfo, existingPosts)
      generatedCount++
      
      // Adicionar post gerado ao contexto de posts existentes
      existingPosts.push({
        file: `${today}-${item.topic}`,
        date: today,
        slug: item.topic.toLowerCase().slice(0, 20).replace(/[^a-z0-9]/g, '-'),
        title: item.topic,
        topic: item.topic
      })

      if (generatedCount < postsToGenerate) {
        console.log('⏳ Aguardando 8s antes do próximo post...')
        await new Promise(r => setTimeout(r, 8000))
      }
    } catch (err) {
      console.error(`❌ Erro ao gerar post para o tópico "${item.topic}":`, err.message)
    }
  }

  console.log(`🎉 Finalizado! ${generatedCount} posts aleatórios foram gerados hoje.`)
}

main().catch(err => {
  console.error('❌ Erro no pipeline de geração:', err)
  process.exit(1)
})
