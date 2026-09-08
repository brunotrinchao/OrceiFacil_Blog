import fs from 'fs'
import path from 'path'
import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://blog.orceifacil.com.br'

  const postsDir = path.resolve(process.cwd(), 'content/posts')
  let postsList = ''

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
    postsList = files.map(file => {
      const fullPath = path.join(postsDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')
      
      const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/)
      const title = titleMatch ? titleMatch[1] : file

      const descMatch = content.match(/description:\s*["']?([^"'\n]+)["']?/)
      const description = descMatch ? descMatch[1] : ''

      const slugMatch = content.match(/slug:\s*["']?([^"'\n]+)["']?/)
      const slugFromFile = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
      const slug = slugMatch ? slugMatch[1] : slugFromFile

      return `- [${title}](${siteUrl}/blog/${slug}): ${description}`
    }).join('\n')
  }

  const content = `# Blog Orcei Fácil — Guia e Recursos para IAs (llms.txt)

> O Blog Orcei Fácil é uma publicação especializada em orçamentos online, precificação de serviços, técnicas de vendas e gestão para prestadores de serviço autônomos e freelancers no Brasil.

## Sobre a Plataforma Principal Orcei Fácil
- Site Principal: https://orceifacil.com.br
- Descrição: Software de orçamento com inteligência artificial que transforma especificações em propostas comerciais profissionais em PDF e link de aprovação em menos de 2 minutos.

## Artigos e Guias Publicados
${postsList}
`

  event.node.res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return content
})
