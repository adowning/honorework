// src/composables/useWebSocketNotifications.ts
import { useNotificationStore } from '@/stores/notifications.ts'
import { useUserStore } from '@/stores/user.ts'
import { useWebSocket, type UseWebSocketReturn } from '@vueuse/core'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { readonly, ref, shallowRef, watch } from 'vue' // Import shallowRef and readonly

// --- Define Message Structures (Keep these or adapt) ---
interface WebSocketNotificationMessage {
  type: 'server_notification'
  payload: {
    message: string
    level?: 'info' | 'success' | 'warning' | 'error'
    displayDuration?: number
  }
}
interface WebSocketStatUpdateMessage {
  type: 'profiles_change'
  data: any
}
// interface MessageToServer {
//   type: string
//   payload: ActionPayload<any> | CommandPayload<any> | SubscribePayload<any>
// }
interface MessageToServer {
  type: string
  data: any //ActionPayload<any> | CommandPayload<any> | SubscribePayload<any>
}
// Default filter function (can be overridden during initialization)
const defaultIsNotificationMessage = (data: any): data is WebSocketNotificationMessage =>
  data && typeof data === 'object' && data.type === 'server_notification' && data.payload?.message

const defaultIsStatsUpdateMessage = (data: any): data is WebSocketStatUpdateMessage =>
  data && typeof data === 'object' && data.type === 'profiles_change' && data.data

// --- Module-level Shared State (Singleton Pattern) ---

let _wsInstance: UseWebSocketReturn<any> | null = null // The raw instance from useWebSocket
const _isInitialized = ref(false) // Has initializeWebSocket been called?
const _connectionStatus = ref<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>('CLOSED')
const _lastError = ref<Event | null>(null)
const _statsSubscriptionStarted = ref(false)
// Use shallowRef for functions as they don't change internally often
const _send = shallowRef<((data: string | ArrayBuffer | Blob) => boolean) | null>(null)
const _sendData = shallowRef<((data: MessageToServer) => boolean) | null>(null)
const _open = shallowRef<(() => void) | null>(null)
const _openProxy = shallowRef<((data: any) => boolean) | null>(null)

const _close = shallowRef<((code?: number, reason?: string) => void) | null>(null)
// --- Internal Initialization Logic ---
function _setupConnection(
  url: string,
  _isNotificationMessage: (data: any) => boolean,
  _isStatsUpdateMessage: (data: any) => boolean,
) {
  if (_isInitialized.value) {
    console.warn('WebSocket connection already initialized. Skipping.')
    return
  }
  if (!url) {
    console.error('WebSocket URL must be provided for initialization.')
    return
  }
  // userStore.token = localStorage.getItem('WSS') || ''
  console.log('Attempting to initialize WebSocket connection to:', url)
  const notificationStore = useNotificationStore() // Get store instance here

  // --- Create the single WebSocket instance ---
  _wsInstance = useWebSocket(url, {
    autoReconnect: {
      retries: 2,
      delay: 2000,
      onFailed: () =>
        notificationStore.addNotification('WebSocket auto-reconnect failed.', 'error', 10000),
    },
    heartbeat: {
      message: JSON.stringify({ type: 'ping', message: 'ping' }),
      interval: 20000,
      pongTimeout: 3000,
      // responseMessage: JSON.stringify({ message: 'pong' }),
    },
    //
    onConnected: (_ws) => {
      console.log('WebSocket connected:', url)
      _connectionStatus.value = 'OPEN'
      _lastError.value = null
      notificationStore.addNotification('Connected to real-time updates.', 'success', 3000)
    },
    onDisconnected: (_ws, event) => {
      console.log('WebSocket disconnected:', event.reason)
      _connectionStatus.value = 'CLOSED' // Also set status here
      _statsSubscriptionStarted.value = false
      if (!event.wasClean) {
        notificationStore.addNotification('Lost real-time connection.', 'warning', 5000)
      }
    },
    onError: (_ws, event) => {
      console.error('WebSocket error:', event)
      _lastError.value = event
      _connectionStatus.value = 'CLOSED' // Often errors lead to closed state
      _statsSubscriptionStarted.value = false
      notificationStore.addNotification('WebSocket connection error.', 'error', 10000)
    },
  })

  // --- Link shared state refs to the instance's reactive properties ---
  watch(_wsInstance.status, (newStatus) => {
    _connectionStatus.value = newStatus
    console.log('WebSocket status changed:', newStatus)
    if (_sendData.value && newStatus === 'OPEN' && _statsSubscriptionStarted.value == false) {
      // setTimeout(() => {
      //   _sendData.value!({
      //     type: 'ping',
      //     payload: {
      //       model: 'User',
      //     },
      //     // properties: ["*"],
      //   })
      // }, 1000)

      _statsSubscriptionStarted.value = true
    }
  })

  // Assign control functions ONCE
  _send.value = _wsInstance.send
  _open.value = _wsInstance.open
  _close.value = _wsInstance.close

  // --- Setup the single listener for incoming notification messages ---
  watch(_wsInstance.data, (newMessage) => {
    const userStore = useUserStore()
    // console.log(_wsInstance)
    // console.log(newMessage)
    const queryClient = useQueryClient()

    if (!newMessage) return
    // console.log('Shared WebSocket listener received:', newMessage);
    try {
      const parsedData = typeof newMessage === 'string' ? JSON.parse(newMessage) : newMessage
      // console.log(parsedData)
      if (parsedData.message === 'ping') {
        const message = { message: 'pong' }
        if (_wsInstance === null) return false
        if (_wsInstance.status.value === 'OPEN') {
          console.log(message)
          _wsInstance.send(JSON.stringify(message))
        }
        return true
      }
      if (parsedData.change_type === 'balance_update') {
        // console.log('gota  balance update')
        // console.log(parsedData)
        userStore.setUserGameStat('balance', parsedData.new_balance)
        queryClient.setQueryData(['balance'], (oldBalance) => {
          return oldBalance || parsedData.new_balance
        })
      }
      // const newMessage = JSON.parse(event.data)
    } catch (e) {
      console.log('Failed to parse WebSocket message or invalid format:', e, newMessage)
    }
  })

  _isInitialized.value = true
  console.log('WebSocket initialization complete.')
}

_sendData.value = (data: any): boolean => {
  if (_wsInstance === null) return false
  if (_wsInstance.status.value === 'OPEN') {
    console.log(data)
    _wsInstance.send(JSON.stringify(data))
  }
  return true
}
_openProxy.value = (data: any): boolean => {
  console.log(_wsInstance)
  if (_wsInstance === null) return false
  console.log(_wsInstance.status.value)
  if (_wsInstance.status.value === 'OPEN') {
    _wsInstance.send(JSON.stringify({ type: 'openProxy', payload: data.payload }))
  }
  return true
}

// --- Exported Functions ---

/**
 * Initializes the shared WebSocket connection.
 * Should be called ONCE during application setup (e.g., in App.vue).
 *
 * @param url The WebSocket server URL.
 * @param isNotificationMessage Optional custom function to identify notification messages.
 */
export function initializeWebSocket(
  url: string,
  isNotificationMessage: (data: any) => boolean = defaultIsNotificationMessage,
  isStatsUpdateMessage: (data: any) => boolean = defaultIsStatsUpdateMessage,
): void {
  _setupConnection(url, isNotificationMessage, isStatsUpdateMessage)
}

/**
 * Composable to access the shared WebSocket state and control functions.
 * Does NOT create a new connection. Call initializeWebSocket() first.
 *
 * @returns Reactive state and control functions for the shared WebSocket connection.
 */
export function useWebSockets() {
  const { data: balance, refetch } = useQuery({
    queryKey: ['balance'],
    queryFn: () => Promise.resolve([]), // Initial empty data
    staleTime: Infinity, // Prevent automatic refetching
  })

  // Return readonly refs for status/error to prevent accidental modification
  // Return the shallowRefs containing the control functions
  return {
    balance,
    refetch,
    openProxy: _openProxy,
    isInitialized: readonly(_isInitialized),
    connectionStatus: readonly(_connectionStatus),
    lastError: readonly(_lastError),
    send: _send, // Ref containing the send function
    sendData: _sendData, // Ref containing the send function
    open: _open, // Ref containing the open function
    close: _close, // Ref containing the close function
  }
}
