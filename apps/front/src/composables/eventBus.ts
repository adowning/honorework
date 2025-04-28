import mitt from 'mitt'

interface Events {
  [key: string]: unknown
  loginResults: any
  isLoading: boolean
  shopOpen: boolean
  leaderBoardOpen: boolean
  profileOpen: boolean
  activeName: string
  settingsOpen: boolean
  settingsModal: boolean
  gainingExp: boolean
  wheelPageOpen: boolean
  updatePurchases: any
  changeStaffView: string
  searchChanged: any
  updateUserStats: any
  updateUser: any
  noMoney: any
  decrementBalance: number
  startExpStarAnimation: string
  updatedUser: any
  pushLogin: boolean
  showTopBar: boolean
  notify: boolean
  updateBalanceSpinCost: number
  updateBalanceWin: number
  profile_balance_channel: any
  CHAT_FROM_TOURNAMENT_MASTER_START: string
  CHAT_FROM_TOURNAMENT_MASTER_SEMIS: string
  CHAT_FROM_TOURNAMENT_MASTER_FINAL: string
}

// interface ChatMessageType {
//   message: string
// }

// type AcknowledgementResponseType = boolean

// export const eventBus = mitt<Events>()
export const eventBus = mitt<any>() // as unknown as typeof mitt<Record<string, unknown>>

// export function useEventBus() {
//   // const { webSocket } = useWebSocket('', { autoReconnect: true })
//   // Game
//   // eventBus.on('gameStart', (data: GameStart) => {
//   //   console.log('gameStart', data)
//   // })
//   // eventBus.on('gameFinished', (data: GameFinished) => {})
// }
/*
import { onBeforeUnmount } from 'vue'
import mitt from 'mitt'

const eventEmitter = mitt()

export default function useEventBus () {
  const eventHandlers: { event: any; handler: any }[] = []

  onBeforeUnmount(() =>
    eventHandlers.forEach((eventHandler) =>
      eventEmitter.off(eventHandler.event, eventHandler.handler)
  ))

  return {
    onEvent: (event: string, handler: any) => {
      eventHandlers.push({ event, handler })
      eventEmitter.on(event, handler)
    },
    emitEvent: (event: any, payload?: unknown) => {
      eventEmitter.emit(event, payload)
    }
  }
}*/
