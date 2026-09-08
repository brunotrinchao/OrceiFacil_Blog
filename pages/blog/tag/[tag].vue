<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://blog.orceifacil.com.br'

const tagSlug = route.params.tag as string

const { data: posts } = await useAsyncData(`tag-${tagSlug}`, () =>
  queryCollection('posts')
    .order('date', 'DESC')
    .all()
)

const filteredPosts = computed(() => {
  if (!posts.value) return []
  return posts.value.filter(p => 
    p.tags && p.tags.some((t: string) => t.toLowerCase().replace(/\s+/g, '-') === tagSlug.toLowerCase())
  )
})

useSeoMeta({
  title: `Artigos com a tag "${tagSlug}" | Blog Orcei Fácil`,
  description: `Confira todos os artigos e guias marcados com a tag ${tagSlug}.`,
  ogUrl: `${siteUrl}/blog/tag/${tagSlug}`
})
</script>

<template>
  <div class="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center space-x-2 text-xs sm:text-sm text-ink-muted mb-8">
      <NuxtLink to="/" class="hover:text-brand transition-colors">Início</NuxtLink>
      <span>/</span>
      <span class="text-ink font-medium">Tag</span>
      <span>/</span>
      <span class="text-ink font-medium">{{ tagSlug }}</span>
    </nav>

    <div class="mb-12 space-y-4">
      <span class="badge-category text-sm px-4 py-1">Tag</span>
      <h1 class="text-3xl sm:text-5xl font-black text-ink tracking-tight">
        #{{ tagSlug }}
      </h1>
    </div>

    <div v-if="filteredPosts && filteredPosts.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <PostCard v-for="post in filteredPosts" :key="post.path || post.slug" :post="post" />
    </div>

    <div v-else class="text-center py-16 space-y-4 bg-surface-soft rounded-3xl border border-surface-line">
      <p class="text-ink-muted text-lg">Nenhum artigo encontrado com esta tag.</p>
      <NuxtLink to="/" class="btn-primary text-sm px-6 py-3">Ver Todos os Artigos</NuxtLink>
    </div>

    <CtaBanner />
  </div>
</template>
