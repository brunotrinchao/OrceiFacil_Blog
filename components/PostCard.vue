<script setup lang="ts">
interface PostProps {
  post: {
    path?: string
    _path?: string
    slug?: string
    title: string
    description: string
    date: string
    category: string
    categorySlug: string
    image?: string
    readTime: string
    tags?: string[]
  }
}

const props = defineProps<PostProps>()

const formattedDate = computed(() => {
  if (!props.post.date) return ''
  try {
    const d = new Date(props.post.date)
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
  } catch (e) {
    return props.post.date
  }
})

const postLink = computed(() => {
  if (props.post.slug) {
    return `/blog/${props.post.slug}`
  }
  const fullPath = props.post.path || props.post._path || ''
  const filename = fullPath.split('/').pop() || ''
  const slugClean = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  return `/blog/${slugClean}`
})
</script>

<template>
  <article class="glass-card rounded-2xl p-5 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
    <div>
      <!-- Imagem de Capa do Post (se disponível) -->
      <NuxtLink :to="postLink" class="block mb-4 rounded-xl overflow-hidden aspect-[16/9] bg-surface-soft border border-surface-line/50 relative">
        <img 
          v-if="post.image" 
          :src="post.image" 
          :alt="post.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-brand-soft to-surface-soft flex items-center justify-center text-brand font-bold text-3xl">
          ⚡
        </div>
      </NuxtLink>

      <!-- Categoria & Tempo de Leitura -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <NuxtLink 
          :to="`/blog/categoria/${post.categorySlug}`"
          class="badge-category hover:bg-brand hover:text-white"
        >
          {{ post.category }}
        </NuxtLink>
        <span class="text-xs text-ink-muted flex items-center gap-1 font-medium">
          ⏱️ {{ post.readTime }}
        </span>
      </div>

      <!-- Título do Post -->
      <h3 class="font-bold text-lg sm:text-xl text-ink group-hover:text-brand transition-colors line-clamp-2 mb-2 leading-snug">
        <NuxtLink :to="postLink">
          {{ post.title }}
        </NuxtLink>
      </h3>

      <!-- Resumo da Descrição -->
      <p class="text-sm text-ink-muted line-clamp-3 mb-4 leading-relaxed">
        {{ post.description }}
      </p>
    </div>

    <!-- Rodapé do Card com Data e Link -->
    <div class="pt-4 border-t border-surface-line/70 flex items-center justify-between text-xs text-ink-muted font-medium">
      <span>{{ formattedDate }}</span>
      <NuxtLink 
        :to="postLink" 
        class="inline-flex items-center text-brand font-semibold group-hover:translate-x-1 transition-transform"
      >
        Ler Artigo →
      </NuxtLink>
    </div>
  </article>
</template>
