import Vue from 'vue'
import Router from 'vue-router'

import AssetCreate from './components/AssetCreate.vue'

Vue.use(Router)


const router= new Router({
    mode: 'history',
    routes: [
        {
            path: '/pko-rapid-triples/',
            name: 'asset_create',
            component: AssetCreate,
            props: {
                asset_type : 'Procedure'
            },
            meta: {
                title: "Cefriel PKO Procedure Generator",
            }
        },
    ]
})

export default router
