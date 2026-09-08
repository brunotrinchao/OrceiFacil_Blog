import fs from 'fs'
import path from 'path'
import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://blog.orceifacil.com.br'

  const postsDir = path.resolve(process.cwd(), 'content/posts')
  let feedItems: string[] = []

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
    feedItems = files.map(file => {
      const fullPath = path.join(postsDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')
      
      const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/)
      const title = titleMatch ? titleMatch[1] : file

      const descMatch = content.match(/description:\s*["']?([^"'\n]+)["']?/)
      const description = descMatch ? descMatch[1] : ''

      const slugMatch = content.match(/slug:\s*["']?([^"'\n]+)["']?/)
      const slugFromFile = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
      const slug = slugMatch ? slugMatch[1] : slugFromFile

      const dateMatch = content.match(/date:\s*["']?([^"'\n]+)["']?/)
      const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

      const catMatch = content.match(/category:\s*["']?([^"'\n]+)["']?/)
      const category = catMatch ? catMatch[1] : 'Geral'

      const url = `${siteUrl}/blog/${slug}`
      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
      <category>${category}</category>
    </item>`
    })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Orcei Fácil — Dicas de Orçamentos e Vendas</title>
    <link>${siteUrl}</link>
    <description>Dicas de orçamento, precificação e vendas para prestadores de serviço autônomos e freelancers no Brasil.</description>
    <language>pt-BR</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${feedItems.join('\n')}
  </channel>
</rss>`

  event.node.res.setHeader('Content-Type', 'text/xml; charset=utf-8')
  return xml
})
