<template>
  <div class="min-h-screen flex flex-col bg-white text-ink font-sans selection:bg-brand-soft selection:text-brand">
    <AppHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
