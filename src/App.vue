<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-dark-900">
    <AppHeader />
    <main class="flex-1 overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>
