import type {
  RouteLocationNormalizedGeneric,
  Router,
  RouteRecordNameGeneric,
  RouteRecordRaw,
} from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/cache/cookies'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import GameLayout from '@/layouts/GameLayout.vue'

const whiteListByPath: string[] = ['/login']
const whiteListByName: RouteRecordNameGeneric[] = []
export function isWhiteList(to: RouteLocationNormalizedGeneric) {
  return whiteListByPath.includes(to.path) || whiteListByName.includes(to.name)
}

const LOGIN_PATH = '/login'
// async function requireAuth(to: any, from: any, next: any) {
//   const userStore = useUserStore()
//   const isAuthenticated = await userStore.isAuthenticated
//   console.log(isAuthenticated)
//   if (!isAuthenticated) {
//     next({ name: 'Login' })
//   } else {
//     // if (to.fullPath == '/login' && auth === 'PLAYER') next({ name: '/home' })
//     next()
//   }
// }
// async function requireCheckLogin(to: any, from: any, next: any) {
//   const authStore = useUserStore()
//   const isAuthenticated = await authStore.isAuthenticated
//   console.log(isAuthenticated)
//   // if (isAuthenticated) {
//   //   next({ name: 'Home' })
//   // } else {
//   next()
//   // }
// }
// export function registerNavigationGuard(router: Router) {
//   router.beforeEach((to, _from) => {
//     const userStore = useUserStore()
//     if (!getToken()) {
//       if (isWhiteList(to)) return true
//       return LOGIN_PATH
//     }
//     if (to.path === LOGIN_PATH) return '/'
//     if (to.meta.roles ? userStore.roles.some((role) => to.meta.roles!.includes(role)) : true)
//       return true
//     return '/403'
//   })
//   // 全局后置钩子
//   // router.afterEach((to) => {
//   //   const keepAliveStore = useKeepAliveStore()
//   //   // 清除所有路由缓存
//   //   if (to.path === LOGIN_PATH) keepAliveStore.delAllCachedRoutes()
//   //   // 添加路由缓存
//   //   keepAliveStore.addCachedRoute(to)
//   //   // 设置标题
//   //   setTitle(to.meta.title)
//   // })
// }

const VITE_PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH

const VITE_ROUTER_HISTORY = import.meta.env.VITE_ROUTER_HISTORY

/** 系统页面 */

/** 业务页面 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
    name: 'Login',
    meta: {
      title: '登录',
    },
    // beforeEnter: requireCheckLogin,
  },
  {
    path: '/',
    redirect: '/home',
  },

  {
    path: '/home',
    component: () => import('@/views/HomeView.vue'),
    name: 'Home',
    meta: {
      title: '首页',
      layout: {
        navBar: {
          showNavBar: false,
          showLeftArrow: false,
        },
        tabbar: {
          showTabbar: true,
          icon: 'home-o',
        },
      },
    },
    // beforeEnter: requireAuth,
  },
  {
    path: '/games/nolimit',
    name: 'Nolmiit',
    component: () => import('@/views/games/NoLimit.vue'),
  },
  // {
  //   path: '/games/',
  //   component: GameLayout,
  //   children: [
  //     {
  //       path: 'redtiger',
  //       name: 'RedTiger',
  //       component: () => import('@/views/games/redtiger/index.vue')
  //     },
  //     {
  //       path: 'netent',
  //       name: 'NetEnt',
  //       component: () => import('@/views/games/netent/index.vue')
  //     },
  //     {
  //       path: 'nolimit',
  //       name: 'Nolmiit',
  //       component: () => import('@/views/games/nolimit/index.vue')
  //     },
  //     {
  //       path: 'pragmatic',
  //       name: 'Pragmatic',
  //       component: () => import('@/views/games/pragmatic/index.vue')
  //     },
  //     {
  //       path: 'netgame',
  //       name: 'NetGame',
  //       component: () => import('@/views/games/netgame/index.vue')
  //     }
  //   ]
  // }
]

/** 路由实例 */
export const router = createRouter({
  history: createWebHistory(VITE_PUBLIC_PATH),
  // VITE_ROUTER_HISTORY === 'hash'
  //   ? createWebHashHistory(VITE_PUBLIC_PATH)
  //   : createWebHistory(VITE_PUBLIC_PATH),
  routes: [...routes],
})
// registerNavigationGuard(router)

// 注册路由导航守卫
