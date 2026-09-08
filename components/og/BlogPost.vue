<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  category?: string
}>()
</script>

<template>
  <div class="w-full h-full bg-slate-950 text-white p-16 flex flex-col justify-between relative overflow-hidden font-sans">
    <!-- Efeito Gradiente Orcei -->
    <div class="absolute -right-32 -top-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
    <div class="absolute -left-32 -bottom-32 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl"></div>

    <!-- Header OG -->
    <div class="flex items-center justify-between relative z-10">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30">
          O
        </div>
        <div>
          <span class="font-extrabold text-2xl tracking-tight text-white">Orcei Fácil</span>
          <span class="ml-2 text-sm font-semibold px-3 py-1 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">Blog</span>
        </div>
      </div>
      <div v-if="category" class="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
        {{ category }}
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="relative z-10 my-auto space-y-4 max-w-4xl">
      <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
        {{ title || 'Blog Orcei Fácil — Dicas de Orçamentos e Vendas' }}
      </h1>
      <p v-if="description" class="text-xl text-slate-400 line-clamp-2 leading-relaxed font-normal">
        {{ description }}
      </p>
    </div>

    <!-- Rodapé OG -->
    <div class="relative z-10 pt-8 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400 font-medium">
      <span>blog.orceifacil.com.br</span>
      <span>Software de Orçamento com IA para Prestadores</span>
    </div>
  </div>
</template>
