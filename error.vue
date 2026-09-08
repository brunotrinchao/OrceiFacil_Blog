<script setup lang="ts">
useHead({
  title: 'Página Não Encontrada | Blog Orcei Fácil',
  meta: [
    { name: 'robots', content: 'noindex, follow' }
  ]
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-surface-soft text-ink font-sans">
    <AppHeader />
    
    <div class="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
      <div class="w-20 h-20 rounded-3xl bg-brand-soft text-brand font-black text-4xl flex items-center justify-center mx-auto shadow-inner">
        404
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-ink">
        Ops! Página não encontrada
      </h1>
      <p class="text-ink-muted text-base max-w-md mx-auto leading-relaxed">
        O artigo ou conteúdo que você procurava pode ter sido movido ou excluído.
      </p>
      
      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink to="/" class="btn-primary text-sm px-6 py-3">
          ← Voltar para o Blog
        </NuxtLink>
        <a href="https://orceifacil.com.br" target="_blank" rel="noopener" class="btn-secondary text-sm px-6 py-3">
          Ir para o Orcei Fácil
        </a>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
