// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@vercel/speed-insights'
  ],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://blog.orceifacil.com.br',
    name: 'Blog Orcei Fácil — Dicas de Orçamento, Vendas e Gestão de Serviços',
  },

  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      titleTemplate: '%s | Blog Orcei Fácil',
      defaultTitle: 'Blog Orcei Fácil — Dicas de Orçamento e Vendas para Prestadores de Serviço',
      htmlAttrs: {
        lang: 'pt-BR'
      },
      script: [
        // Google Tag Manager Snippet
        {
          children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PDLCTT2M');`,
          type: 'text/javascript'
        }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'RSS Feed - Blog Orcei Fácil', href: '/rss.xml' },
        { rel: 'alternate', type: 'text/plain', title: 'LLMs.txt - Blog Orcei Fácil', href: '/llms.txt' },
        { rel: 'icon', type: 'image/x-icon', href: 'https://orceifacil.com.br/images/favicon/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: 'https://orceifacil.com.br/images/favicon/favicon-96x96.png' },
        { rel: 'icon', type: 'image/svg+xml', href: 'https://orceifacil.com.br/images/favicon/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://orceifacil.com.br/images/favicon/apple-touch-icon.png' }
      ],
      meta: [
        { name: 'author', content: 'Orcei Fácil' },
        { name: 'theme-color', content: '#0870f8' }
      ]
    }
  },

  content: {
    markdown: {
      anchorLinks: false,
      toc: {
        depth: 3,
        searchDepth: 3
      }
    }
  },

  nitro: {
    preset: 'vercel',
    exports: {
      hidePoweredBy: true
    },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml', '/rss.xml', '/llms.txt']
    }
  },

  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://blog.orceifacil.com.br',
      mainAppUrl: 'https://orceifacil.com.br',
    }
  },

  compatibilityDate: '2024-04-03',
  devtools: { enabled: false }
})
