import { useStorage } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Timestamp from 'timestamp-nano'
import { v4 as uuidv4 } from 'uuid'
// import { useCookies } from '@vueuse/integrations/useCookies'

import { computed, ref, watch } from 'vue'
import { DefaultCashflowClientOptions } from '@/libs/cashflowClient/client/CashflowClient'
import { CashflowInfo, CashflowAction, CashflowViewer } from '@/libs/cashflowClient/client/types'
import { useCashflow } from '@/libs/cashflowClient/vue'

export const useCashflowStore = defineStore('streamerbot', () => {
  const MAX_LOGS_LENGTH = 1000

  // Configuration (LocalStorage)
  const host = useStorage('sb:toolkit:host', () => DefaultCashflowClientOptions.host)
  const token = useStorage('sb:toolkit:token', () => DefaultCashflowClientOptions.password)
  const password = useStorage('sb:toolkit:password', () => DefaultCashflowClientOptions.password)
  const port = useStorage('sb:toolkit:port', () => DefaultCashflowClientOptions.port)
  const endpoint = useStorage('sb:toolkit:endpoint', () => DefaultCashflowClientOptions.endpoint)
  const isNewConnection = useStorage('sb:toolkit:new', () => true)
  // if (token.value == null || !token) token.value = null
  // if (password.value == null) password.value = null
  console.log(token.value)
  const settings = computed(() => ({
    host: host.value,
    port: port.value,
    endpoint: endpoint.value,
    token: token.value,
    password: password.value,
    immediate: !isNewConnection.value,
    subscribe: '*' as any,
    onConnect,
  }))

  // Client Connection State
  const { client, error, status, connect: _connect, data } = useCashflow(settings)
  const isConnected = computed(() => status.value === 'OPEN')
  const isConnecting = computed(() => status.value === 'CONNECTING')

  // Client Data
  const instance = useStorage<Partial<CashflowInfo>>(
    'sb:toolkit:instance',
    {
      instanceId: undefined,
      name: undefined,
      os: undefined,
      version: undefined,
    },
    localStorage,
    { mergeDefaults: true },
  )
  const connect = async function (username: string, password: string) {
    // const { get, getAll, set, remove, addChangeListener, removeChangeListener } = useCookies(
    //   ['cookie-name'],
    //   {
    //     doNotParse: false,
    //     autoUpdateDependencies: false,
    //   },
    // )

    console.log(username, password)

    const response = await fetch(`http://localhost:3001/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()

    if (data.error > 400) {
      return
    }
    if (!data.token || data.token == null) {
      return
    }
    const x = data.token
    console.log(x)
    localStorage.setItem('sb:toolkit:token', x)
    const t = localStorage.getItem('sb:toolkit:token')
    // set('token', data.token)
    settings.value.token = t as string
    console.log(settings.value.token)
    _connect()
  }

  const actions = useStorage<Array<CashflowAction>>('sb:toolkit:actions', [])
  const variables = ref<Array<unknown>>()
  const activeViewers = ref<Array<CashflowViewer>>()
  // const broadcaster = useStorage<Partial<GetBroadcasterResponse>>(
  //   'sb:toolkit:broadcaster',
  //   {
  //     platforms: undefined,
  //     connected: [],
  //     disconnected: [],
  //   },
  //   localStorage,
  //   { mergeDefaults: true },
  // )
  const broadcasterAvatar = useStorage<string | null>('sb:toolkit:avatar', null)

  // Logger Data
  const logs = useStorage<
    Array<{
      id: string
      title: string
      timeStamp: string
      event: {
        source: string
        type: string
      }
      data: any
      raw: any
    }>
  >('sb:toolkit:logs:v2', [])

  async function onConnect(data: CashflowInfo) {
    // save instance info
    instance.value = data && data.instanceId ? data : instance.value

    // load data
    actions.value = (await client.value?.getActions())?.actions ?? []
    // broadcaster.value = await client.value?.getBroadcaster()

    // toggle flag to reconnect next time automatically
    isNewConnection.value = false

    // attach listeners to update actions on change
    client.value?.on('Application.*', async () => {
      actions.value = (await client.value?.getActions())?.actions ?? []
    })
  }

  async function fetchActions() {
    actions.value = (await client.value?.getActions())?.actions ?? []
  }

  async function fetchActiveViewers() {
    activeViewers.value = (await client.value?.getActiveViewers())?.viewers
  }

  async function fetchAvatar(username: string = '') {
    if (!username || broadcasterAvatar.value) return
    const res = await fetch(`https://decapi.me/twitch/avatar/${username}`, {
      mode: 'cors',
      credentials: 'omit',
    })
    broadcasterAvatar.value = await res.text()
    return broadcasterAvatar.value
  }

  function clearLogs(options: { type?: string } = {}) {
    if (options?.type) {
      logs.value = logs.value.filter((log: any) => log.event.type !== options.type)
    } else {
      logs.value = []
    }
  }

  // watch(broadcaster, () => {
  //   fetchAvatar(broadcaster.value?.platforms?.twitch?.broadcastUserName)
  // })

  watch(data, (val: any) => {
    if (val?.event) {
      // normalize timestamp
      val._time = Timestamp.fromDate(new Date()).addNano(performance.now()).toJSON()

      // add our own unique id and title for indexing/searching
      val.id = val.id ?? uuidv4()

      // add custom string for search text
      val._search = `${val.event.source} - ${val.event.type}`

      logs.value.push(val)
    }

    if (logs.value?.length > MAX_LOGS_LENGTH) {
      logs.value.slice(-MAX_LOGS_LENGTH)
    }
  })

  return {
    status,
    host,
    port,
    token,
    endpoint,
    isNewConnection,
    client,
    connect,
    error,
    isConnected,
    isConnecting,
    instance,
    actions,
    variables,
    activeViewers,
    // broadcaster,
    broadcasterAvatar,
    logs,
    fetchActions,
    fetchActiveViewers,
    fetchAvatar,
    clearLogs,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCashflowStore, import.meta.hot))
}
