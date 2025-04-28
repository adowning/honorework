import { CacheKey } from '@/utils/cache-key'
import Cookies from 'js-cookie'

// const SYSTEM_NAME: string = 'blue-game'

// /** Key used when caching data */
// class CacheKey {
//   static readonly TOKEN: string = `${SYSTEM_NAME}-token-key`
//   static readonly SIDEBAR_STATUS: string = `${SYSTEM_NAME}-sidebar-status-key`
//   static readonly ACTIVE_THEME_NAME: string = `${SYSTEM_NAME}-active-theme-name-key`
// }

// export default CacheKey

export const createWebSocket = (route: string) => {
  const socket = new WebSocket(
    // `${import.meta.env.VITE_SOKET_URL}${route}?token=${Cookies.get(CacheKey.TOKEN)}`,
    `wss://mobile.cashflowcasino.com/api/setup?token=${Cookies.get(CacheKey.TOKEN)}`,
  )
  return socket
}
