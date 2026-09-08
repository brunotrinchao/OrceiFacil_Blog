<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  buttonText?: string
}>()
</script>

<template>
  <div class="my-12 rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-navy text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
    <!-- Glow de Fundo -->
    <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
    
    <div class="relative z-10 max-w-2xl space-y-4">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
        ⚡ Automação com Inteligência Artificial
      </span>
      
      <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
        {{ title || 'Crie seu primeiro orçamento profissional em 2 minutos' }}
      </h3>
      
      <p class="text-white/80 text-sm sm:text-base leading-relaxed">
        {{ subtitle || 'Escreva os detalhes do serviço do seu jeito. Nossa IA organiza as especificações e gera um orçamento impecável em PDF e link de aprovação. Grátis para testar!' }}
      </p>
      
      <div class="pt-4 flex flex-col sm:flex-row gap-4">
        <a 
          href="https://orceifacil.com.br" 
          target="_blank" 
          rel="noopener"
          class="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-brand bg-white hover:bg-brand-soft transition-all duration-200 shadow-lg text-center"
        >
          {{ buttonText || 'Gerar Meu Orçamento Grátis →' }}
        </a>
      </div>
    </div>
  </div>
</template>
