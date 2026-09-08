<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://blog.orceifacil.com.br'

const slugParam = route.params.slug as string

// Buscar post na coleção 'posts' usando API v3
const { data: doc } = await useAsyncData(`post-${slugParam}`, async () => {
  const post = await queryCollection('posts')
    .where('slug', '=', slugParam)
    .first()
  
  if (post) return post

  // Fallback se a busca direta por slug exato não encontrar
  const allPosts = await queryCollection('posts').all()
  return allPosts.find((p: any) => 
    p.slug === slugParam || 
    p.path?.endsWith(slugParam) ||
    (p.stem && p.stem.endsWith(slugParam))
  ) || null
})

const currentUrl = computed(() => `${siteUrl}/blog/${slugParam}`)

// Head Meta Tags & SEO
if (doc.value) {
  useSeoMeta({
    title: doc.value.title,
    ogTitle: doc.value.title,
    description: doc.value.description,
    ogDescription: doc.value.description,
    ogImage: doc.value.image || 'https://orceifacil.com.br/images/landpage-banner.jpg',
    ogUrl: currentUrl.value,
    ogType: 'article',
    articlePublishedTime: doc.value.date,
    articleModifiedTime: doc.value.updatedAt || doc.value.date,
    articleSection: doc.value.category,
    articleTag: doc.value.tags,
    ogLocale: 'pt_BR',
    twitterCard: 'summary_large_image'
  })

  // Schema JSON-LD Completo
  const jsonLdGraph: any[] = [
    {
      '@type': 'BlogPosting',
      '@id': `${currentUrl.value}#article`,
      'headline': doc.value.title,
      'description': doc.value.description,
      'datePublished': doc.value.date,
      'dateModified': doc.value.updatedAt || doc.value.date,
      'image': doc.value.image ? `${siteUrl}${doc.value.image}` : 'https://orceifacil.com.br/images/landpage-banner.jpg',
      'inLanguage': 'pt-BR',
      'mainEntityOfPage': currentUrl.value,
      'author': {
        '@type': 'Organization',
        'name': doc.value.author?.name || 'Redação Orcei Fácil',
        'url': 'https://orceifacil.com.br'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Orcei Fácil',
        'url': 'https://orceifacil.com.br',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://orceifacil.com.br/images/favicon/favicon-96x96.png'
        }
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${currentUrl.value}#breadcrumb`,
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Início',
          'item': siteUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': doc.value.category || 'Blog',
          'item': `${siteUrl}/blog/categoria/${doc.value.categorySlug || 'geral'}`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': doc.value.title,
          'item': currentUrl.value
        }
      ]
    }
  ]

  // Se houver FAQ, adicionar o schema FAQPage
  if (doc.value.faq && doc.value.faq.length) {
    jsonLdGraph.push({
      '@type': 'FAQPage',
      '@id': `${currentUrl.value}#faq`,
      'mainEntity': doc.value.faq.map((f: any) => ({
        '@type': 'Question',
        'name': f.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': f.answer
        }
      }))
    })
  }

  useHead({
    link: [
      { rel: 'canonical', href: currentUrl.value }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': jsonLdGraph
        })
      }
    ]
  })
}
</script>

<template>
  <div class="py-12 sm:py-16">
    <article v-if="doc" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Breadcrumb Navigation -->
      <nav class="flex items-center space-x-2 text-xs sm:text-sm text-ink-muted mb-8" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-brand transition-colors">Início</NuxtLink>
        <span>/</span>
        <NuxtLink :to="`/blog/categoria/${doc.categorySlug}`" class="hover:text-brand transition-colors font-medium">
          {{ doc.category }}
        </NuxtLink>
        <span>/</span>
        <span class="text-ink font-medium truncate max-w-[200px] sm:max-w-none">{{ doc.title }}</span>
      </nav>

      <!-- Cabeçalho do Artigo -->
      <header class="space-y-6 pb-8 border-b border-surface-line mb-8">
        <div class="flex items-center gap-3">
          <NuxtLink :to="`/blog/categoria/${doc.categorySlug}`" class="badge-category">
            {{ doc.category }}
          </NuxtLink>
          <span class="text-xs text-ink-muted font-medium">⏱️ {{ doc.readTime }}</span>
          <span class="text-xs text-ink-muted font-medium">• {{ doc.date }}</span>
        </div>

        <h1 class="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight">
          {{ doc.title }}
        </h1>

        <p class="text-lg sm:text-xl text-ink-muted leading-relaxed">
          {{ doc.description }}
        </p>

        <!-- Imagem de Capa do Artigo -->
        <div v-if="doc.image" class="rounded-2xl overflow-hidden aspect-[16/9] shadow-lg border border-surface-line">
          <img 
            :src="doc.image" 
            :alt="doc.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Autor Box Mini -->
        <div class="flex items-center gap-3 pt-2">
          <div class="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand font-bold">
            ✍️
          </div>
          <div>
            <p class="text-sm font-bold text-ink">{{ doc.author?.name || 'Redação Orcei Fácil' }}</p>
            <p class="text-xs text-ink-muted">{{ doc.author?.role || 'Especialistas em Orçamentos e Vendas' }}</p>
          </div>
        </div>
      </header>

      <!-- Disclaimer sobre Inteligência Artificial -->
      <div class="mb-10 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs sm:text-sm flex items-start gap-3.5 shadow-sm">
        <span class="text-xl shrink-0">🤖</span>
        <div class="leading-relaxed">
          <strong class="font-bold text-amber-950">Nota de Transparência de IA:</strong> Este conteúdo foi gerado com auxílio de modelos de Inteligência Artificial para fins instrutivos e educacionais. As informações podem conter imprecisões técnicas ou variações de mercado. Recomendamos sempre validar especificações, preços e normas técnicas com um profissional qualificado da sua região.
        </div>
      </div>

      <!-- Corpo do Artigo Markdown -->
      <div class="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-brand hover:prose-a:text-brand-dark leading-relaxed">
        <ContentRenderer :value="doc" />
      </div>

      <!-- Banner de Conversão no meio/fim do post -->
      <CtaBanner 
        title="Quer aplicar essas dicas no seu próximo orçamento?"
        subtitle="Crie orçamentos de serviços profissionais com Inteligência Artificial em apenas 2 minutos. Sem complicação!"
        buttonText="Gerar Orçamento Grátis com IA →"
      />

      <!-- Seção de FAQ WAI-ARIA com Rich Snippet Schema -->
      <FaqAccordion v-if="doc.faq && doc.faq.length" :faq-list="doc.faq" />

      <!-- Caixa de Autor e Sobre a Plataforma -->
      <div class="mt-12 p-8 rounded-2xl bg-surface-soft border border-surface-line flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <!-- Logo Oficial Orcei Fácil -->
        <img 
          src="/images/favicon/favicon.svg" 
          alt="Orcei Fácil" 
          class="w-16 h-16 rounded-2xl object-contain shrink-0 shadow-md p-1.5 bg-white border border-surface-line" 
        />
        <div class="space-y-2 text-center sm:text-left">
          <h4 class="font-bold text-lg text-ink">Sobre a Redação Orcei Fácil</h4>
          <p class="text-sm text-ink-muted leading-relaxed">
            O Orcei Fácil é o software de orçamento com IA feito para ajudar prestadores de serviço autônomos e freelancers do Brasil a profissionalizarem suas vendas, economizarem tempo e fecharem mais contratos.
          </p>
          <a 
            href="https://orceifacil.com.br" 
            target="_blank" 
            rel="noopener"
            class="inline-block text-xs font-semibold text-brand hover:underline pt-2"
          >
            Conheça o sistema Orcei Fácil →
          </a>
        </div>
      </div>

    </article>

    <!-- Erro 404 local se artigo não for encontrado -->
    <div v-else class="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
      <h1 class="text-3xl font-bold text-ink">Artigo não encontrado</h1>
      <p class="text-ink-muted">O artigo solicitado não existe ou foi atualizado.</p>
      <NuxtLink to="/" class="btn-primary text-sm px-6 py-3">← Voltar para o Blog</NuxtLink>
    </div>
  </div>
</template>
