import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'multi-select',
      component: () => import('@/views/index')
    }
  ]
})
