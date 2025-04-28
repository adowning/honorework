// import { CashflowClient } from './client/CashflowClient'
import { CashflowClient as WSClient } from './client/CashflowClient'
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { EXITTYPE, Netcfg, SENDTYPE } from './NetCfg'
import { CashflowRequestName } from './client/types'
import getValue from '@/utils/get'
import { authController } from './controllers/authController'

// class Client {
//   public static WSClient = WSClient
export class Network {
  private static instance: Network

  // private wsClient: WSClient = new WSClient()

  private netCfg: Netcfg = new Netcfg()

  private connectCall: Function = () => {} //Link successful

  // private wsdisconnect: boolean = false //Whether to disconnect or not

  // private removeTime: number = 10 //10 seconds without packet return force off loading so players can resend packets

  // private removeWsTime: number = 30

  // private sendCount: { [key: number]: number } = {}
  private authController = authController
  private socket: WSClient

  private service: any

  // private request: any

  private noWaitView: string[] = []

  constructor() {
    this.service = this.createService()
    this.onUnsolicited()
    this.socket = new WSClient()
  }

  public static getInstance() {
    if (!Network.instance) {
      Network.instance = new Network()
    }

    return Network.instance
  }
  /**
   * 解析服务端主动推送的包
   */
  private onUnsolicited() {
    // TODO 主動消息處理的解釋（可以跟服務端協定）
    // starx.on('unsolicited', (msgs: any) => {
    //   console.log('推送信息', msgs)
    //   let route = msgs.route
    //   this.evenMgr.emit(route, msgs)
    // })
  }
  /**
   * create request instance
   */
  private createService() {
    const service = axios.create()
    // request interception
    service.interceptors.request.use(
      (config: any) => config,
      // Failed to send
      (error: any) => Promise.reject(error),
    )
    // Response interception (can be adjusted according to specific business)
    service.interceptors.response.use(
      (response: any) => {
        // apiData is the data returned by the API
        const apiData = response.data as any
        // This Code is the business Code agreed with the backend
        const code = apiData.code
        // If there is no Code, it means that this is not an API developed by the project backend
        if (code === undefined) {
          return Promise.reject(new Error('non-system interface'))
        } else {
          // return apiData/
          switch (code) {
            case 200:
              // code === 0 means no error
              return apiData
            case 0:
              // code === 0 means failed
              return apiData
            case 100000:
              // code === 100000 means Passed data exception
              return apiData
            case 100001:
              // code === 100001 means The password does not meet the requirements
              return apiData
            case 100002:
              // code === 100002 User account is locked
              return apiData
            case 101001:
              // code === 200 means Login data exception
              return apiData
            case 101002:
              // code === 200 means The login account or password is wrong
              return apiData
            case 101003:
              // code === 101003 means Login account does not exist
              return apiData
            case 102001:
              // code === 102001 means Failed to register data
              return apiData
            case 102002:
              // code === 102002 means Registration data exception
              return apiData
            case 102003:
              // code === 102003 means Registering an existing account is abnormal
              return apiData
            case 103001:
              // code === 103001 means Abnormal nickname format (abnormal length or illegal identifier)
              return apiData
            case 103002:
              // code === 103002 means Nickname is the same as email
              return apiData
            case 103003:
              // code === 103003 means Email format exception (abnormal length or illegal identifier)
              return apiData
            case 103004:
              // code === 103004 means Phone format exception (abnormal length or illegal identifier)
              return apiData
            case 103005:
              // code === 103005 means The same password needs to be changed
              return apiData
            case 103006:
              // code === 103006 means The current password is wrong
              return apiData
            case 103007:
              // code === 103007 means The emails that need to be modified are the same
              return apiData
            case 103008:
              // code === 103008 means The message that needs to be modified is already taken
              return apiData
            case 103009:
              // code === 103009 means The avatar index that needs to be modified is wrong
              return apiData
            case 103010:
              // code === 103010 means wrong birthday format
              return apiData
            default:
              // is not the correct Code
              return Promise.reject(new Error('Error'))
          }
        }
      },
      (error: any) => {
        // Status is the HTTP status code
        const status = getValue(error, 'response.status')
        switch (status) {
          case 400:
            error.message = 'wrong request'
            break
          case 401:
            // When the token expires, directly log out and force refresh the page (redirect to the login page)
            // location.reload()
            break
          case 403:
            error.message = 'access denied'
            break
          case 404:
            error.message = 'Request address error'
            break
          case 408:
            error.message = 'Request timed out'
            break
          case 500:
            error.message = 'internal server error'
            break
          case 501:
            error.message = 'service not implemented'
            break
          case 502:
            error.message = 'gateway error'
            break
          case 503:
            error.message = 'service is not available'
            break
          case 504:
            error.message = 'gateway timeout'
            break
          case 505:
            error.message = 'HTTP version not supported'
            break
          default:
            break
        }
        return Promise.reject(error)
      },
    )
    return service
  }
  // /**
  //  * 数据解析
  //  * @param msg
  //  * @param type
  //  * @param version
  //  */
  // private msgParsing(route: string, msg: any, type: SENDTYPE) {
  //   // TODO 根據情況重構
  //   msg = msg || {}
  //   switch (type) {
  //     case SENDTYPE.HTTP:
  //       break
  //     case SENDTYPE.SOCKET:
  //       console.log('发包', route, msg)

  //       break
  //     default:
  //       break
  //   }
  //   return msg
  // }

  /**
   * Offer Agreement
   * @param route     Routing Interface routing distinction
   * @param msg       Package contents
   * @param next      Callback
   * @param type      send type
   */
  public async sendMsg(
    requestNameOrRoute: CashflowRequestName,
    msg: any,
    next: Function,
    type: SENDTYPE, // = SENDTYPE.SOCKET,
    // requestType: SENDTYPE, //= SENDTYPE.HTTP,//
  ) {
    // Build a contract structure
    // let msgData = this.msgParsing(route, msg, type)
    switch (type) {
      // case SENDTYPE.HTTP:
      // switch (requestType) {
      case SENDTYPE.AUTH:
        // await this.GET(requestNameOrRoute, msg, next)
        switch (requestNameOrRoute) {
          case 'Login':
            if (!msg.username || !msg.password) {
              throw new Error('username or password is undefined')
            }
            let result
            try {
              result = await this.authController.login(msg.params, msg)
              next(result)
            } catch (e) {
              next(result)
            }
            break
        }
      // case SENDTYPE.POST:
      //   await this.POST(requestNameOrRoute, msg, next)
      //   break
      // // }
      case SENDTYPE.SOCKET:
        // if (typeof requestNameOrRoute != typeof CashflowRequestName) return
        this.socketReq(requestNameOrRoute as CashflowRequestName, msg, next)
        break
      default:
        break
    }
  }
  //pomelo发包请求
  public socketReq(route: CashflowRequestName, msg: any, callBack: Function) {
    this.socket.request({ request: route }, msg, 1).then((response: any) => {
      callBack(response)
    })
  }

  // /**
  //  * Send post
  //  * @param route
  //  * @param msg
  //  * @param next
  //  * @param timeout
  //  */
  // private async POST(route: CashflowRequestName | CashflowRequestRoute, data: any, next: Function) {
  //   this.request = this.createRequestFunction(this.service)
  //   await this.request({
  //     url: route,
  //     method: 'POST',
  //     data,
  //   }).then((response: any) => {
  //     next(response)
  //   })
  // }
  // /**
  //  * Send get
  //  * @param route
  //  * @param msg
  //  */
  // private GET(route: CashflowRequestName | CashflowRequestRoute, data: any, next: Function) {
  //   this.request = this.createRequestFunction(this.service)
  //   return this.request({
  //     url: route,
  //     method: 'GET',
  //     params: data,
  //   }).then((response: any) => {
  //     next(response)
  //   })
  // }
  /**
   * create request method
   */
  private createRequestFunction(
    service: AxiosInstance,
    timeout: number = this.netCfg.getTimeout(),
    token: string | undefined = this.netCfg.getToken(),
  ) {
    return function <T>(config: AxiosRequestConfig): Promise<T> {
      const configDefault = {
        headers: {
          Authorization: 'Bearer ' + token,
          'X-Language': 'en',
        },
        timeout: timeout,
        baseURL: import.meta.env.VITE_BASE_API,
        data: {},
      }
      return service(Object.assign(configDefault, config))
    }
  }

  public async request(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    uri: string,
    body: unknown,
    query: Record<string, string>,
  ): Promise<any> {
    const url = new URL('https://api.cashflowcasino.com/api' + uri)
    url.search = new URLSearchParams(query).toString()
    const token = localStorage.getItem('access_token')
    if (!token && !uri.includes('login') && !uri.includes('register'))
      throw new Error('No access token')
    const params: RequestInit = {
      method,
      // Required for content to be correctly parsed by NestJS
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }

    // Setting a body is forbidden on GET requests
    if (method !== 'GET') {
      params.body = JSON.stringify(body)
    }

    const res = await fetch(url.toString(), params)
    // Handle failed requests
    if (!res.ok) {
      console.log(res)
      // throw Error(res.statusText)
      return { code: res.status }
    }
    return res.json()
  }
}

export const cashflowClient = Network.getInstance()
