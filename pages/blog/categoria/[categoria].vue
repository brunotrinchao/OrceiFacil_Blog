<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://blog.orceifacil.com.br'

const categoriaSlug = route.params.categoria as string

const { data: posts } = await useAsyncData(`category-${categoriaSlug}`, () =>
  queryCollection('posts')
    .where('categorySlug', '=', categoriaSlug)
    .order('date', 'DESC')
    .all()
)

const categoryName = computed(() => {
  if (posts.value && posts.value.length > 0) {
    return posts.value[0].category
  }
  return categoriaSlug.charAt(0).toUpperCase() + categoriaSlug.slice(1)
})

useSeoMeta({
  title: `Artigos de ${categoryName.value} | Blog Orcei Fácil`,
  description: `Confira todos os artigos, guias e dicas de orçamento para a categoria ${categoryName.value}.`,
  ogTitle: `Artigos sobre ${categoryName.value} — Orcei Fácil`,
  ogUrl: `${siteUrl}/blog/categoria/${categoriaSlug}`
})
</script>

<template>
  <div class="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center space-x-2 text-xs sm:text-sm text-ink-muted mb-8">
      <NuxtLink to="/" class="hover:text-brand transition-colors">Início</NuxtLink>
      <span>/</span>
      <span class="text-ink font-medium">Categoria</span>
      <span>/</span>
      <span class="text-ink font-medium capitalize">{{ categoryName }}</span>
    </nav>

    <div class="mb-12 space-y-4">
      <span class="badge-category text-sm px-4 py-1">Categoria</span>
      <h1 class="text-3xl sm:text-5xl font-black text-ink tracking-tight capitalize">
        {{ categoryName }}
      </h1>
      <p class="text-ink-muted text-base max-w-2xl">
        Guias, dicas e modelos de orçamento desenvolvidos especialmente para profissionais do setor de {{ categoryName }}.
      </p>
    </div>

    <div v-if="posts && posts.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <PostCard v-for="post in posts" :key="post.path || post.slug" :post="post" />
    </div>

    <div v-else class="text-center py-16 space-y-4 bg-surface-soft rounded-3xl border border-surface-line">
      <p class="text-ink-muted text-lg">Nenhum artigo encontrado nesta categoria ainda.</p>
      <NuxtLink to="/" class="btn-primary text-sm px-6 py-3">Ver Todos os Artigos</NuxtLink>
    </div>

    <CtaBanner />
  </div>
</template>
