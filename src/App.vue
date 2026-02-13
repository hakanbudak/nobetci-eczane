<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-slate-50">
    <AppHeader />
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>
  </div>
</template>
