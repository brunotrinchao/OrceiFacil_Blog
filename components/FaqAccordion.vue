<script setup lang="ts">
import { ref } from 'vue'

interface FaqItem {
  question: string
  answer: string
}

defineProps<{
  faqList: FaqItem[]
}>()

const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div v-if="faqList && faqList.length" class="space-y-4 my-10">
    <h3 class="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
      ❓ Perguntas Frequentes (FAQ)
    </h3>
    <div 
      v-for="(item, index) in faqList" 
      :key="index"
      class="border border-surface-line rounded-xl overflow-hidden bg-white transition-all"
    >
      <button 
        @click="toggle(index)"
        type="button"
        class="w-full px-6 py-4 text-left flex items-center justify-between font-semibold text-ink hover:text-brand transition-colors focus:outline-none"
        :aria-expanded="openIndex === index"
      >
        <span class="text-base sm:text-lg pr-4">{{ item.question }}</span>
        <span class="text-xl font-bold text-brand transform transition-transform duration-200" :class="{ 'rotate-180': openIndex === index }">
          ↓
        </span>
      </button>
      <div 
        v-show="openIndex === index" 
        class="px-6 pb-5 pt-1 text-sm text-ink-muted leading-relaxed border-t border-surface-line/50 bg-surface-soft/40"
      >
        <p>{{ item.answer }}</p>
      </div>
    </div>
  </div>
</template>
