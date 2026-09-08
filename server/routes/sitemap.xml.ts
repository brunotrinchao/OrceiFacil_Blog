import fs from 'fs'
import path from 'path'
import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://blog.orceifacil.com.br'

  const postsDir = path.resolve(process.cwd(), 'content/posts')
  let postUrls: any[] = []

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
    postUrls = files.map(file => {
      const fullPath = path.join(postsDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')
      
      const slugMatch = content.match(/slug:\s*["']?([^"'\n]+)["']?/)
      const slugFromFile = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
      const slug = slugMatch ? slugMatch[1] : slugFromFile

      const dateMatch = content.match(/date:\s*["']?([^"'\n]+)["']?/)
      const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

      return {
        loc: `${siteUrl}/blog/${slug}`,
        lastmod: date,
        priority: '0.9',
        changefreq: 'weekly'
      }
    })
  }

  const staticUrls = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${siteUrl}/blog/categoria/eletrica`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${siteUrl}/blog/categoria/hidraulica`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${siteUrl}/blog/categoria/pintura`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${siteUrl}/blog/categoria/reformas`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${siteUrl}/blog/categoria/vendas`, priority: '0.8', changefreq: 'weekly' }
  ]

  const allUrls = [...staticUrls, ...postUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  event.node.res.setHeader('Content-Type', 'text/xml; charset=utf-8')
  return xml
})
