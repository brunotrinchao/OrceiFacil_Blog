<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()
const siteUrl = config.public.siteUrl || 'https://blog.orceifacil.com.br'

// Buscar todos os posts da coleção 'posts' usando API v3 do @nuxt/content
const { data: posts } = await useAsyncData('all-posts', () => 
  queryCollection('posts')
    .order('date', 'DESC')
    .all()
)

// Destaque (último post)
const featuredPost = computed(() => posts.value && posts.value.length > 0 ? posts.value[0] : null)
const regularPosts = computed(() => posts.value && posts.value.length > 1 ? posts.value.slice(1) : [])

// Categorias derivadas dos posts — chips navegam para a página de artigos da categoria
const categories = computed(() => {
  if (!posts.value) return []
  const seen = new Map()
  for (const p of posts.value) {
    if (p.category && p.categorySlug && !seen.has(p.categorySlug)) {
      seen.set(p.categorySlug, p.category)
    }
  }
  return [...seen.entries()].map(([slug, name]) => ({ slug, name }))
})

function getPostLink(post: any) {
  if (!post) return '/'
  if (post.slug) return `/blog/${post.slug}`
  const fullPath = post.path || post._path || ''
  const filename = fullPath.split('/').pop() || ''
  const slugClean = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  return `/blog/${slugClean}`
}

// SEO Meta
useSeoMeta({
  title: 'Blog Orcei Fácil — Dicas de Orçamentos, Vendas e Gestão',
  ogTitle: 'Blog Orcei Fácil — Aprenda a Fechar Mais Orçamentos de Serviços',
  description: 'Dicas práticas sobre como criar orçamentos irrecusáveis, precificar serviços de elétrica, hidráulica, pintura e reformas, e vender mais.',
  ogDescription: 'Aprenda a fechar mais orçamentos de serviços com dicas práticas, precificação e automação com Inteligência Artificial.',
  ogImage: 'https://orceifacil.com.br/images/landpage-banner.jpg',
  ogUrl: siteUrl,
  ogType: 'website',
  ogLocale: 'pt_BR',
  twitterCard: 'summary_large_image'
})

// Schema JSON-LD
useHead({
  link: [
    { rel: 'canonical', href: siteUrl }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            'url': siteUrl,
            'name': 'Blog Orcei Fácil',
            'description': 'Dicas de orçamento, precificação e vendas para prestadores de serviço.',
            'inLanguage': 'pt-BR'
          },
          {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            'name': 'Orcei Fácil',
            'url': 'https://orceifacil.com.br',
            'logo': 'https://orceifacil.com.br/images/favicon/favicon-96x96.png',
            'sameAs': [
              'https://www.instagram.com/orceifacil',
              'https://www.linkedin.com/company/orceifacil'
            ]
          }
        ]
      })
    }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Banner do Blog -->
    <section class="relative bg-gradient-to-b from-surface-soft via-white to-white py-16 sm:py-24 border-b border-surface-line overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-soft text-brand text-xs sm:text-sm font-semibold">
          💡 Conteúdo Gratuito para Prestadores de Serviço
        </div>
        
        <h1 class="text-4xl sm:text-6xl font-black text-ink tracking-tight max-w-4xl mx-auto leading-tight">
          Feche mais contratos com orçamentos <span class="text-brand">profissionais</span>.
        </h1>
        
        <p class="text-base sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed font-normal">
          Dicas práticas de precificação, modelos de propostas comerciais e estratégias de vendas para eletricistas, encanadores, pintores e pedreiros.
        </p>

        <!-- CTA Rápido -->
        <div class="pt-4 flex justify-center">
          <a 
            href="https://orceifacil.com.br" 
            target="_blank" 
            rel="noopener"
            class="btn-primary text-sm sm:text-base px-8 py-3.5"
          >
            Conhecer Gerador de Orçamentos com IA →
          </a>
        </div>
      </div>
    </section>

    <!-- Lista de Artigos -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      <!-- Navegação por Categorias (chips) -->
      <div v-if="categories.length" class="mb-12" aria-label="Navegar por categoria">
        <div class="flex flex-wrap items-center gap-2.5 justify-center">
          <NuxtLink
            to="/"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40
                   cursor-pointer select-none"
            :class="route.path === '/'
              ? 'bg-brand text-white border-brand shadow-md shadow-brand/20'
              : 'bg-white text-ink-muted border-surface-line hover:border-brand/40 hover:text-brand'"
          >
            Todos
          </NuxtLink>
          <NuxtLink
            v-for="cat in categories"
            :key="cat.slug"
            :to="`/blog/categoria/${cat.slug}`"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40
                   cursor-pointer select-none"
            :class="route.path === `/blog/categoria/${cat.slug}`
              ? 'bg-brand text-white border-brand shadow-md shadow-brand/20'
              : 'bg-white text-ink-muted border-surface-line hover:border-brand/40 hover:text-brand'"
          >
            {{ cat.name }}
          </NuxtLink>
        </div>
      </div>

      <!-- Artigo em Destaque -->
      <div v-if="featuredPost" class="mb-16">
        <div class="flex items-center gap-2 mb-6">
          <span class="text-xs font-bold uppercase tracking-wider text-brand">⭐ Artigo em Destaque</span>
          <div class="flex-grow h-px bg-surface-line"></div>
        </div>
        
        <div class="glass-card rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border border-surface-line shadow-xl">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="badge-category">{{ featuredPost.category }}</span>
              <span class="text-xs text-ink-muted font-medium">⏱️ {{ featuredPost.readTime }}</span>
            </div>
            <h2 class="text-2xl sm:text-4xl font-extrabold text-ink leading-tight hover:text-brand transition-colors">
              <NuxtLink :to="getPostLink(featuredPost)">
                {{ featuredPost.title }}
              </NuxtLink>
            </h2>
            <p class="text-ink-muted text-base leading-relaxed line-clamp-3">
              {{ featuredPost.description }}
            </p>
            <div class="pt-4 flex items-center justify-between">
              <span class="text-xs text-ink-muted font-semibold">{{ featuredPost.date }}</span>
              <NuxtLink
                :to="getPostLink(featuredPost)"
                class="btn-primary text-sm px-6 py-2.5"
              >
                Ler Artigo Completo →
              </NuxtLink>
            </div>
          </div>

          <!-- Banner Visual Destaque -->
          <div class="rounded-2xl bg-gradient-to-br from-brand-soft via-surface-soft to-white p-8 border border-brand/20 text-center space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-brand text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand/30">
              ⚡
            </div>
            <h3 class="font-bold text-xl text-ink">Orçamentos Rápidos & Impecáveis</h3>
            <p class="text-xs text-ink-muted leading-relaxed">
              Use a Inteligência Artificial do Orcei Fácil para organizar valores, materiais e contrato em menos de 2 minutos.
            </p>
            <a href="https://orceifacil.com.br" target="_blank" rel="noopener" class="btn-secondary w-full text-xs py-2.5">
              Experimentar Grátis
            </a>
          </div>
        </div>
      </div>

      <!-- Feed Geral de Posts -->
      <div>
        <h2 class="text-2xl font-bold text-ink mb-8 flex items-center gap-2">
          📚 Artigos Recentes
        </h2>

        <div v-if="regularPosts.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PostCard
            v-for="post in regularPosts"
            :key="post.path || post.slug"
            :post="post"
          />
        </div>

        <div v-else-if="!featuredPost" class="text-center py-16 space-y-4">
          <p class="text-ink-muted text-lg">Carregando artigos do blog...</p>
        </div>
      </div>

      <!-- Banner de Conversão do Blog -->
      <CtaBanner />
    </section>
  </div>
</template>
