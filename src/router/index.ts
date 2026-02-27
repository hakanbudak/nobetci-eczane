import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            title: 'Nöbetçi Eczane - En Yakın Nöbetçi Eczaneyi Bul',
            description: 'Türkiye genelinde nöbetçi eczaneleri anında bulun. Konumunuza en yakın nöbetçi eczaneyi harita üzerinde görün.',
        },
    },
    {
        path: '/:city',
        name: 'city',
        component: () => import('@/views/CityView.vue'),
        meta: {
            title: 'Nöbetçi Eczane',
            description: 'Nöbetçi eczaneleri görüntüleyin.',
        },
    },
    {
        path: '/:city/:district',
        name: 'district',
        component: () => import('@/views/DistrictView.vue'),
        meta: {
            title: 'Nöbetçi Eczane',
            description: 'Nöbetçi eczaneleri görüntüleyin.',
        },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) return savedPosition
        return { top: 0 }
    },
})

router.beforeEach((to) => {
    const title = to.meta.title as string | undefined
    if (title) {
        document.title = title
    }
})

export default router
