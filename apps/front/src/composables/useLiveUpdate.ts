// // @ts-nocheck

// /* eslint-disable unused-imports/no-unused-vars */
// import { Commands } from '@cashflow/shared'
// import { useWebSocket } from '@vueuse/core'
// import { computed, onUnmounted, reactive, ref, watch } from 'vue'
// import { useUserStore } from '@/stores/user'

// export interface DebugInfo {
//   status: Ref<string>
//   subscriptions: Ref<Array<Subscription>>
//   values: Record<string, any>
// }

// export interface Subscription {
//   id: number
//   objectPath: string
//   propertyPath: string
// }

// export interface UseLiveUpdateReturn {
//   status: Ref<string>
//   connectionUserInfo: Ref<string>
//   reconnect: () => void
//   subscribe: (
//     objectPath: string,
//     refNameToPropertyPaths: Record<string, string>
//   ) => Record<string, ComputedRef<any>>
//   autoSubscribe: (
//     objectPath: string,
//     propertyPaths: string[]
//   ) => Record<string, ComputedRef<any>>
//   debugInfo: DebugInfo
// }

// export interface LiveUpdateOverlayProps {
//   liveUpdate: UseLiveUpdateReturn
// }

// /**
//  * Initializes the live update system with a WebSocket connection.
//  * @param director - The WebSocket IP endpoint (host:port) to connect to.
//  * @returns The live update API including status, subscribe, autoSubscribe, and debugInfo.
//  */
// export function useLiveUpdate(director: string): UseLiveUpdateReturn

// export function _useLiveUpdate(director): object {
//   if (!director) {
//     console.error('Error: \'director\' parameter is required.')
//     throw new Error('\'director\' parameter is required.')
//   }

//   const userStore = useUserStore()
//   // Initialize the WebSocket connection & provide reactive data.
//   const socketUrl = `https://${director}/`
//   const { status, data, send, open, ws } = useWebSocket(socketUrl, {
//     autoConnect: false,
//   })

//   const connectionUserInfo = ref('')

//   function installWsEventHandlers(ws: WebSocket | undefined) {
//     ws.addEventListener('error', (ev: any) => {
//       // Usually immediately followed by a close event.
//       // This event contains no information about the error.
//       connectionUserInfo.value = 'WebSocket error'
//     })
//     ws.addEventListener('close', (ev: { code: string | number }) => {
//       // Provide information about the close reason code
//       const reason: any
//         = {
//           1000: 'Normal closure',
//           1001: 'Going away',
//           1002: 'Protocol error',
//           1003: 'Unsupported data',
//           1005: 'No status code',
//           1006: 'Could not establish connection',
//           1007: 'Invalid data',
//           1008: 'Policy violation',
//           1009: 'Message too big',
//           1010: 'Extension required',
//           1011: 'Internal error',
//           1015: 'TLS handshake',
//         }[ev.code] || ev.code
//       connectionUserInfo.value = reason
//       console.log(reason)
//       // setTimeout(reconnect, 5000);
//     })
//   }
//   watch(ws, installWsEventHandlers)
//   watch(status, (newStatus) => {
//     if (newStatus === 'OPEN') {
//       // Resubscribe to all subscriptions when the connection is re-established.
//       // group by objectPath.
//       const objectPathToProperties = {}
//       subscriptions.value.forEach((sub) => {
//         if (!objectPathToProperties[sub.objectPath]) {
//           objectPathToProperties[sub.objectPath] = []
//         }
//         objectPathToProperties[sub.objectPath].push(sub.propertyPath)
//       })
//       for (const [objectPath, propertyPaths] of Object.entries(objectPathToProperties)) {
//         innerSubscribe(objectPath, propertyPaths)
//       }
//     }
//   })

//   function reconnect() {
//     open()
//   }

//   installWsEventHandlers(ws.value)

//   // Reactive data for the live update system.
//   const subscriptions = ref([])
//   const keyToValue = reactive({})
//   const keyToId = {}
//   const idToKey = {}

//   function innerSubscribe(objectPath: string, properties: unknown) {
//     const msg = {
//       type: Commands.SUBSCRIBE,
//       // subscribe: {
//       object: objectPath,
//       properties,
//       // },
//     }
//     send(JSON.stringify(msg))
//   }

//   function subscribe(
//     objectPath: any,
//     refNameToPropertyPaths: { [s: string]: unknown } | ArrayLike<unknown>,
//   ) {
//     const properties = Object.values(refNameToPropertyPaths)
//     innerSubscribe(objectPath, properties)
//     const keys: string[] = []
//     const computedValues = {}
//     for (const [refName, propertyPath] of Object.entries(refNameToPropertyPaths)) {
//       const key = `${objectPath}/${propertyPath}`
//       keys.push(key)
//       console.log(key)
//       computedValues[refName] = computed({
//         get: () => keyToValue[key],
//         set: (newValue) => {
//           const id = keyToId[key]
//           if (id) {
//             setValues([{ id, value: newValue }])
//           }
//         },
//       })
//     }

//     // onUnmounted(() => {
//     //   unsubscribe(keys)
//     // })
//     return computedValues
//   }

//   function autoSubscribe(objectPath: any, propertyPaths: any[]) {
//     const refNameToPropertyPaths = {}
//     propertyPaths.forEach((propertyPath: string) => {
//       const sanitizedPropertyPath = propertyPath.startsWith('object.')
//         ? propertyPath.slice(7)
//         : propertyPath
//       const refName = sanitizedPropertyPath.replace(/\./g, '_')
//       refNameToPropertyPaths[refName] = propertyPath
//     })
//     return subscribe(objectPath, refNameToPropertyPaths)
//   }

//   function unsubscribe(keys: any[]) {
//     const ids: any[] = []
//     keys.forEach((key: string | number) => {
//       const id = keyToId[key]
//       if (id !== undefined) {
//         ids.push(id)
//       }
//     })
//     if (ids.length > 0) {
//       const msg = { unsubscribe: { ids } }
//       send(JSON.stringify(msg))
//     }
//   }

//   function setValues(newValues: { id: any, value: any }[]) {
//     const setMessages: { id: any, value: any }[] = []
//     newValues.forEach(({ id, value }) => {
//       setMessages.push({ id, value })
//     })
//     if (setMessages.length > 0) {
//       const msg = { set: setMessages }
//       send(JSON.stringify(msg))
//     }
//   }

//   watch(data, (newMessage) => {
//     // console.log(newMessage)
//     if (!newMessage) return

//     let parsed
//     try {
//       parsed = JSON.parse(newMessage)
//     } catch (err) {
//       console.error('Error parsing Live Update message:', newMessage)
//       return
//     }
//     console.log(parsed)

//     if (parsed.error) {
//       console.error('Live Update Error:', parsed.error)
//       return
//     }
//     if (parsed.channel !== undefined) {
//       if (parsed.channel === 'profile_balance_channel' || parsed.channel === 'user_notification_channel') {
//         userStore.updateCurrentUserBalance(parsed.data)
//       }
//     }
//     if (parsed.subscriptions) {
//       subscriptions.value = parsed.subscriptions
//       console.log(subscriptions.value)

//       Object.keys(keyToId).forEach((key) => delete keyToId[key])
//       Object.keys(idToKey).forEach((id) => delete idToKey[id])
//       subscriptions.value.forEach((sub: any) => {
//         const key = `${sub.objectPath}/${sub.propertyPath}`
//         keyToId[key] = sub.id
//         idToKey[sub.id] = key
//       })
//     }

//     if (parsed.valuesChanged) {
//       parsed.valuesChanged.forEach((change: { id: string | number, value: any }) => {
//         const key = idToKey[change.id]
//         keyToValue[key] = change.value
//       })
//     }
//   })

//   return {
//     status,
//     connectionUserInfo,
//     reconnect,
//     subscribe,
//     autoSubscribe,
//     debugInfo: {
//       status,
//       subscriptions,
//       values: keyToValue,
//     },
//   }
// }
// let liveUpdate: UseLiveUpdateReturn // = useLiveUpdate('mobile.cashflowcasino.com')

// export function useLiveUpdate(): UseLiveUpdateReturn {
//   if (!liveUpdate) {
//     liveUpdate = _useLiveUpdate('mobile.cashflowcasino.com')
//   }
//   return liveUpdate
// }

// class Singleton {
//   private static instance: Singleton

//   // Private constructor to prevent direct instantiation
//   private constructor() { }

//   // Method to get the singleton instance
//   static getInstance(): Singleton {
//     if (!Singleton.instance) {
//       Singleton.instance = new Singleton()
//     }
//     return Singleton.instance
//   }
// }

// // Usage
// const instance1 = Singleton.getInstance()
// const instance2 = Singleton.getInstance()

// // export default {
// //   setup() {
// //     const urlParams = new URLSearchParams(window.location.search)
// //     const directorEndpoint = urlParams.get('director')
// //     const liveUpdate = useLiveUpdate(directorEndpoint)
// //     const { offset, rotation } = liveUpdate.autoSubscribe('screen2:surface_1', ['object.offset', 'object.rotation'])

// //     // Subscribe to more complex-named properties by providing the name
// //     const { scaleX } = liveUpdate.subscribe('screen2:surface_1', { scaleX: 'object.scale.x' })

// //     return { liveUpdate, offset, rotation }
// //   }
// // }
