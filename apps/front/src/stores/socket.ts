import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import { CacheKey } from '@/utils/cache-key'
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'
import { Network as Network1 } from '@/net/Network1'
import { useAuthStore } from './auth'
// import { NETWORK } from '@/utils/socket/NetworkCfg'
// import { Network } from '@/utils/socket/network'

export const createWebSocket = (route: string) => {
  console.log(`${import.meta.env.VITE_SOKET_URL}${route}?token=${Cookies.get(CacheKey.TOKEN)}`)
  const socket = new WebSocket(
    `wss://mobile.cashflowcasino.com/api/setup?token=mock_token`, //?token=${Cookies.get(CacheKey.TOKEN)}`,
    // `${import.meta.env.VITE_SOKET_URL}${route}?token=${Cookies.get(CacheKey.TOKEN)}`,
  )
  return socket
}

export interface GetUserBalance {
  bal: string | number
  cur: string
  mt: number
}
export const useSocketStore = defineStore('socket', () => {
  // State
  const success = ref<boolean>(false)
  const errMessage = ref<string>('')
  const socket = ref<any>(null)
  const socketBalance = ref<GetUserBalance>({
    bal: '',
    cur: '',
    mt: 0,
  })

  // Getters
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getSocketBalance = computed(() => socketBalance.value)

  // Actions
  function setSuccess(newSuccess: boolean) {
    success.value = newSuccess
  }

  function setErrorMessage(newMessage: string) {
    errMessage.value = newMessage
  }

  function setSocketBalance(newSocketBalance: GetUserBalance) {
    socketBalance.value = newSocketBalance
  }
  async function connected(x: any) {
    console.log('connected ', x)
  }
  // socket connect check
  async function dispatchSocketConnect() {
    console.log('dispatchSocketConnect')
    setSuccess(false)
    const route: string = NETWORK.WEB_SOCKET.SOCKET_CONNECT
    console.log(route)
    const network: Network = Network.getInstance()
    const network1: Network1 = Network1.getInstance()
    network1.connect(connected)
    console.log('x')
    socket.value = createWebSocket(route)
    console.log(socket.value)
    if (socket.value) {
      socket.value.onopen = handleOpen
      socket.value.onmessage = handleMessage
      socket.value.onerror = handleError
      socket.value.onclose = handleClose
    }
  }

  function handleOpen() {
    const authStore = useAuthStore()
    console.log('WebSocket connection established')
    authStore.setIsAuthenticated(true)
  }

  function handleMessage(event: MessageEvent) {
    // console.log('Received message:', event.data)
    try {
      const response = JSON.parse(event.data)
      console.log(response)
      if (response.onFundMessage !== undefined) {
        console.log(response.onFundMessage.mt)
        switch (response.onFundMessage.mt) {
          case 101:
            setSocketBalance(response.onFundMessage.data as GetUserBalance)
            break
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  function handleError(event: Event) {
    console.error('WebSocket error:', event)
  }

  function handleClose(event: CloseEvent) {
    console.log('WebSocket connection closed:', event)
  }

  return {
    success,
    errMessage,
    socket,
    socketBalance,
    getSuccess,
    getErrMessage,
    getSocketBalance,
    setSuccess,
    setErrorMessage,
    setSocketBalance,
    dispatchSocketConnect,
    handleOpen,
    handleMessage,
    handleError,
    handleClose,
  }
})
// // import { useUserStore } from '@/stores/modules/user';
// import { eventBus } from '@/composables/eventBus';
// import { CHANNEL_DEFAULT, CHANNEL_KICK_OFF, UPGRADE_CHANNEL } from '@/utils/constants';
// import { defineStore } from 'pinia';
// // import { LOGIN_URL } from '@/config';
// import { ref } from 'vue';
// // import { ElMessageBox } from 'element-plus';
// import { useUserStore } from '@/stores/user';

// // 是否使用socket 当 import.meta.env.VITE_SOCKET_URL 不为空时，启用websocket
// const useSocket = Object.prototype.hasOwnProperty.call(import.meta.env, 'VITE_SOCKET_URL');
// const socketUrl = import.meta.env.VITE_SOCKET_URL;
// const MAX_RECONNECT_COUNT = 10;

// /**
//  * 使用socket
//  * @param url
//  * @returns {{init: (function(): void), socket: null}}
//  */
// export const useSocketStore = defineStore('socket', () => {
//   /**
//    * 定义socket变量
//    *
//    * @type {WebSocket|null}
//    */
//   const socket = ref<WebSocket | null>(null);

//   const canReconnect = ref(true);

//   const reconnectCount = ref(0);

//   const _onOpen = () => {
//     canReconnect.value = true;
//     reconnectCount.value = 0;
//   };

//   const _onMessage = (event: MessageEvent) => {
//     const { data } = event;
//     const userStore = useUserStore();
//     // const authStore = useAuthStore();
//     try {
//       const res = JSON.parse(data);
//       switch (res.channel) {
//         case CHANNEL_DEFAULT:
//           break;
//         case CHANNEL_KICK_OFF:
//           close();
//           // 1.清除 Token
//           // userStore.clear();
//           userStore.$reset()
//           // authStore.clear();
//           console.log('kicked off')
//           // ElMessageBox.alert('您已经被强制踢下线了！', '温馨提示', {
//           //   confirmButtonText: '确定',
//           //   type: 'warning',
//           //   callback: () => {
//           //     // 2.重定向到登陆页
//           //     router.replace(LOGIN_URL);
//           //   }
//           // });
//           break;
//         case UPGRADE_CHANNEL:
//           close();
//           // 1.清除 Token
//           // userStore.clear();
//           // authStore.clear();
//           // authStore.clear();
//           console.log('UPGRADE_CHANNEL')

//           // ElMessageBox.alert(res.data + '！', '温馨提示', {
//           //   confirmButtonText: '确定',
//           //   type: 'warning',
//           //   callback: () => {
//           //     // 2.重定向到登陆页
//           //     router.replace(LOGIN_URL);
//           //   }
//           // });
//           break;

//         default:
//           eventBus.emit(`socket.${res.channel}`, res.data);
//       }
//       console.log('接收到的消息：', res);
//     } catch (e) {
//       /* empty */
//     }
//   };

//   const _onError = (event: Event) => {
//     eventBus.emit('socket.error', event);
//   };

//   const _onClose = () => {
//     socket.value = null;
//     if (canReconnect.value) {
//       handleReconnect();
//     }
//   };

//   const handleReconnect = () => {
//     let timeout;
//     if (reconnectCount.value < MAX_RECONNECT_COUNT) {
//       timeout = Math.min(10000 * Math.pow(2, reconnectCount.value), 30000); // 指数退避算法
//     } else {
//       timeout = 60000; // 超过最大次数次后，每分钟重试一次
//     }
//     setTimeout(() => {
//       reconnectCount.value++;
//       open();
//     }, timeout);
//   };

//   /**
//    * 初始化开启socket
//    */
//   const open = () => {
//     if (!useSocket) return;
//     if (socket.value) return;
//     const userStore = useUserStore();
//     // 建立WebSocket连接
//     const webSocket = new WebSocket(socketUrl, [userStore.token]);
//     const { status, data, send, open, close } = useWebSocket(socketUrl, {
//       autoReconnect: {
//         retries: 2,
//         delay: 1000,
//         onFailed() {
//           Message.error('连接失败,请去GrasscuttersWebDashboard查看处理方法')
//           localStorage.removeItem("WSS")
//         },
//       },
//       // 监听WebSocket事件
//       webSocket.onopen = _onOpen;
//       webSocket.onmessage = _onMessage;
//       webSocket.onerror = _onError;
//       webSocket.onclose = _onClose;

//       // 连接时处理
//       socket.value = webSocket;
//     };

//     /**
//      * 关闭socket
//      */
//     const close = () => {
//       if (!useSocket) return;
//       if (!socket.value) return;
//       canReconnect.value = false;
//       reconnectCount.value = 0;
//       socket.value.close();
//       socket.value = null;
//     };

//     const send = (data: any, channel: string = CHANNEL_DEFAULT) => {
//       if (!socket.value || socket.value.readyState !== 1) return;
//       if (typeof data !== 'object') {
//         data = { data };
//       }
//       const msgData = {
//         channel,
//         data
//       };
//       socket.value.send(JSON.stringify(msgData));
//     };

//     return {
//       open,
//       send,
//       close
//     };
//   });
