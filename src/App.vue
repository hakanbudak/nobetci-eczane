<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-dark-900">
    <main class="flex-1 overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>
