import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: 'posts/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        slug: z.string(),
        date: z.string(),
        updatedAt: z.string().optional(),
        category: z.string(),
        categorySlug: z.string(),
        image: z.string().optional(),
        tags: z.array(z.string()),
        keywords: z.array(z.string()),
        readTime: z.string(),
        author: z.object({
          name: z.string().default('Redação Orcei Fácil'),
          role: z.string().default('Especialistas em Orçamentos e Vendas'),
          avatar: z.string().default('https://orceifacil.com.br/images/favicon/favicon-96x96.png')
        }).optional(),
        faq: z.array(z.object({
          question: z.string(),
          answer: z.string()
        })).optional()
      })
    })
  }
})
