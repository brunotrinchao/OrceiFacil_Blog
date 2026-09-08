<template>
  <footer class="bg-navy text-white pt-16 pb-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
        
        <!-- Coluna 1: Sobre o Orcei Fácil -->
        <div class="space-y-4 md:col-span-1">
          <div class="flex items-center gap-3">
            <AppLogo size="md" :light="true" />
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">Blog</span>
          </div>
          <p class="text-slate-400 text-sm leading-relaxed">
            Software de orçamento online com inteligência artificial para prestadores de serviços, freelancers e profissionais autônomos.
          </p>
          <a 
            href="https://orceifacil.com.br" 
            target="_blank" 
            rel="noopener" 
            class="inline-flex items-center text-xs font-semibold text-brand hover:underline gap-1"
          >
            Acessar Plataforma Orcei Fácil →
          </a>
        </div>

        <!-- Coluna 2: Categorias do Blog -->
        <div>
          <h4 class="font-semibold text-sm tracking-wider uppercase text-slate-300 mb-4">Navegação do Blog</h4>
          <ul class="space-y-2.5 text-sm text-slate-400">
            <li><NuxtLink to="/blog/categoria/eletrica" class="hover:text-white transition-colors">Serviços Elétricos</NuxtLink></li>
            <li><NuxtLink to="/blog/categoria/hidraulica" class="hover:text-white transition-colors">Serviços Hidráulicos</NuxtLink></li>
            <li><NuxtLink to="/blog/categoria/pintura" class="hover:text-white transition-colors">Pintura e Acabamento</NuxtLink></li>
            <li><NuxtLink to="/blog/categoria/reformas" class="hover:text-white transition-colors">Reformas e Obras</NuxtLink></li>
            <li><NuxtLink to="/blog/categoria/vendas" class="hover:text-white transition-colors">Técnicas de Vendas</NuxtLink></li>
          </ul>
        </div>

        <!-- Coluna 3: Ferramentas & SaaS -->
        <div>
          <h4 class="font-semibold text-sm tracking-wider uppercase text-slate-300 mb-4">Plataforma Orcei Fácil</h4>
          <ul class="space-y-2.5 text-sm text-slate-400">
            <li><a href="https://orceifacil.com.br" target="_blank" rel="noopener" class="hover:text-white transition-colors">Gerador de Orçamento com IA</a></li>
            <li><a href="https://orceifacil.com.br/planos" target="_blank" rel="noopener" class="hover:text-white transition-colors">Planos & Preços</a></li>
            <li><a href="https://orceifacil.com.br/privacy" target="_blank" rel="noopener" class="hover:text-white transition-colors">Política de Privacidade</a></li>
            <li><a href="https://orceifacil.com.br/terms" target="_blank" rel="noopener" class="hover:text-white transition-colors">Termos de Uso</a></li>
          </ul>
        </div>

        <!-- Coluna 4: CTA de Conversão no Rodapé -->
        <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h4 class="font-bold text-base text-white">Crie propostas irrecusáveis</h4>
          <p class="text-xs text-slate-400 leading-relaxed">
            Monte orçamentos em 2 minutos com nossa IA e impressione seus clientes.
          </p>
          <a 
            href="https://orceifacil.com.br" 
            target="_blank" 
            rel="noopener"
            class="btn-primary w-full text-center text-xs py-2.5 px-4"
          >
            Começar Grátis Agora
          </a>
        </div>

      </div>

      <!-- Copyright -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {{ new Date().getFullYear() }} Orcei Fácil. Todos os direitos reservados.</p>
        <p class="flex items-center gap-4">
          <span>Blog para Prestadores de Serviço do Brasil</span>
        </p>
      </div>
    </div>
  </footer>
</template>
