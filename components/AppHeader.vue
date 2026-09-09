<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-line transition-all duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20">
        
        <!-- Logo Orcei Fácil -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <AppLogo size="md" />
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-soft text-brand">Blog</span>
        </NuxtLink>

        <!-- Navegação Desktop -->
        <nav class="hidden md:flex items-center space-x-6 text-sm font-medium text-ink-muted">
          <NuxtLink to="/" class="hover:text-brand transition-colors">Início</NuxtLink>
        </nav>

        <!-- CTA Principal -->
        <div class="hidden sm:flex items-center space-x-4">
          <a 
            href="https://orceifacil.com.br" 
            target="_blank"
            rel="noopener"
            class="btn-primary text-sm font-semibold py-2.5 px-5"
          >
            Criar Orçamento Grátis →
          </a>
        </div>

        <!-- Botão Menu Mobile -->
        <div class="flex md:hidden">
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen" 
            type="button" 
            class="p-2 rounded-lg text-ink-muted hover:text-brand hover:bg-surface-soft focus:outline-none"
            aria-label="Abrir Menu"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <!-- Dropdown Menu Mobile -->
    <div v-if="isMobileMenuOpen" class="md:hidden border-b border-surface-line bg-white px-4 pt-2 pb-6 space-y-3">
      <NuxtLink
        to="/"
        @click="isMobileMenuOpen = false"
        class="block py-2 text-base font-medium text-ink hover:text-brand"
      >
        Início
      </NuxtLink>
      <div class="pt-4 border-t border-surface-line">
        <a 
          href="https://orceifacil.com.br" 
          target="_blank"
          rel="noopener"
          class="btn-primary w-full text-center text-sm"
        >
          Criar Orçamento Grátis com IA
        </a>
      </div>
    </div>
  </header>
</template>
