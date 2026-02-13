<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useCities } from '@/composables/useCities'

useHead({
  title: 'Tüm Şehirler - Nöbetçi Eczane',
  meta: [
    {
      name: 'description',
      content: 'Türkiye\'nin 81 ilinde nöbetçi eczane bilgilerine ulaşın. Şehir seçerek nöbetçi eczaneleri görüntüleyin.',
    },
    { property: 'og:title', content: 'Tüm Şehirler - Nöbetçi Eczane' },
    { name: 'robots', content: 'index, follow' },
  ],
})

const { allCities, searchCities } = useCities()
const searchQuery = ref('')

const filteredCities = computed(() => searchCities(searchQuery.value))

const regions: Record<string, string[]> = {
  'Marmara': ['istanbul', 'bursa', 'balikesir', 'tekirdag', 'kocaeli', 'edirne', 'canakkale', 'kirklareli', 'sakarya', 'yalova', 'bilecik'],
  'Ege': ['izmir', 'aydin', 'mugla', 'denizli', 'manisa', 'kutahya', 'afyonkarahisar', 'usak'],
  'Akdeniz': ['antalya', 'adana', 'mersin', 'hatay', 'kahramanmaras', 'osmaniye', 'burdur', 'isparta'],
  'İç Anadolu': ['ankara', 'konya', 'kayseri', 'eskisehir', 'sivas', 'yozgat', 'aksaray', 'nigde', 'nevsehir', 'kirsehir', 'kirikkale', 'karaman', 'cankiri'],
  'Karadeniz': ['trabzon', 'samsun', 'ordu', 'rize', 'giresun', 'artvin', 'amasya', 'tokat', 'corum', 'sinop', 'kastamonu', 'zonguldak', 'bolu', 'duzce', 'bartin', 'karabuk', 'bayburt', 'gumushane'],
  'Doğu Anadolu': ['erzurum', 'van', 'malatya', 'elazig', 'erzincan', 'agri', 'kars', 'igdir', 'mus', 'bingol', 'bitlis', 'hakkari', 'tunceli', 'ardahan'],
  'Güneydoğu Anadolu': ['gaziantep', 'diyarbakir', 'sanliurfa', 'mardin', 'batman', 'siirt', 'sirnak', 'adiyaman', 'kilis'],
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 mb-1">Tüm Şehirler</h1>
      <p class="text-sm text-slate-500">Türkiye'nin 81 ilinde nöbetçi eczane bilgileri</p>
    </div>

    <div class="mb-6">
      <div class="relative">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Şehir ara..."
          class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 outline-none transition-all"
        />
      </div>
    </div>

    <div v-if="searchQuery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <RouterLink
        v-for="city in filteredCities"
        :key="city.slug"
        :to="`/${city.slug}`"
        class="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
      >
        {{ city.name }}
      </RouterLink>
    </div>

    <div v-else class="space-y-8">
      <div v-for="(slugs, regionName) in regions" :key="regionName">
        <h2 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
          {{ regionName }}
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <RouterLink
            v-for="slug in slugs"
            :key="slug"
            :to="`/${slug}`"
            class="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
          >
            {{ allCities.find((c) => c.slug === slug)?.name || slug }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
