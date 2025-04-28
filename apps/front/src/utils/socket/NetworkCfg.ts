//import { ChannelCfg } from "../config/ChannelCfg";

import { CashflowRequestName } from '@/libs/cashflowClient/client/types'

/**
 * 发包类型枚举
 */
// export enum SENDTYPE {
//   NONE,
//   HTTP,
//   AUTH,
//   SOCKET,
//   UNSOLICITED, //主动回包
// }

//退出类型 1-踢下线， 2-用户禁用, 3-平台维护, 4-同账号重复登陆
export enum EXITTYPE {
  NONE,
  USER_EXIT,
  TOKEN_ERROR,
  MAINTAIN,
  ACC_REPEAT,
}

//TOKEN错误码
export const NETWORK_TOKEN: number = 100011

/**
 * 网络配置类
 */
export class Netcfg {
  private static instance: Netcfg

  private token: string = ''

  private webhost: string = ''

  private websocker_ip: string = ''

  private websocker_port: number = 0

  private websocker_path: string = ''

  private timeout: number = 10000 //正常发包延迟10000毫秒

  private neglect: number[] = [
    180014, //恢复房间
  ]

  private TempRouteNoLog = [
    'ABManager.onBetSerPush',
    'DTManager.onBetSerPush',
    'DTCManager.onBetSerPush',
  ]

  constructor() {
    this.resetData()
  }

  public static getInstance(): Netcfg {
    if (!Netcfg.instance) {
      Netcfg.instance = new Netcfg()
    }

    return Netcfg.instance
  }

  /**
   * 重置数据
   */
  public resetData() {
    // TODO 需要引入配置文件
    this.token = ''

    this.webhost = ''

    this.websocker_ip = ''

    this.websocker_port = 0

    this.websocker_path = ''
  }

  /**
   * 设值token
   * @param token
   */
  public setToken(token: string): void {
    this.token = token
  }

  /** 获取当前token */
  public getToken(): string {
    return this.token
  }

  /**
   * 设值http发包地址
   * @param ip
   * @param host
   * @param path
   */
  public setWebHost(ip: string, host?: number, path?: string): void {
    this.webhost = ip
    if (host != null) this.webhost = `${this.webhost}:${host}`
    if (path != null && path != '') this.webhost = `${this.webhost}${path}`
  }

  /**
   * 返回发包地址
   * @returns this.webhost 返回当前地址
   */
  public getWebHost(): string {
    return this.webhost
  }

  /**
   * 设值websocker发包地址
   * @param host
   * @param port
   * @param path
   */
  public setWebSocker(host: string, port?: number, path?: string): void {
    this.websocker_ip = host
    if (port) this.websocker_port = port
    if (path) this.websocker_path = path
  }

  /**
   * 返回发包地址
   * @returns this.websocker 返回当前地址
   */
  public getWebSocker() {
    return { host: this.websocker_ip, port: this.websocker_port, path: this.websocker_path }
  }

  public getTimeout(): number {
    return this.timeout
  }

  /**
   * 部分协议临时去除日志
   * @returns
   */
  public getTempNoLog() {
    return this.TempRouteNoLog
  }

  /**
   * 检查可忽略的错误码
   * @param code
   * @returns
   */
  public checkNeglectCode(code: number) {
    return this.neglect.findIndex((num) => num == code) != -1
  }
}
export namespace NETWORK {
  //Login Related News
  export class LOGIN {
    static LOGIN: CashflowRequestName = 'Login' //Login
    static REGISTER: CashflowRequestName = 'Register' //Registration
  }

  //Business logic after entering the home page
  export class HOME_PAGE {}

  // websocket api
  export class WEB_SOCKET {
    static SOCKET_CONNECT = '/user/connect/websocket'
  }

  // // user profile info api config group
  // export class PERSONAL_INFO_PAGE {
  //   static USER_AMOUNT = 'user/amount' // get user amount
  //   static USER_INFO = '/user/info' // get user profile
  //   static USER_BALANCE = '/user/balance' // get user balance
  //   static SET_USER_CURRENCY = '/user/currency' // set user currency

  //   static USER_CHANGE = '/user/change' // update user info
  //   static USER_EMAIL = '/user/email' // update email
  //   static USER_PASSWORD = '/user/password' // update password
  //   static USER_SUSPEND = '/user/suspend' // suspend user
  //   static USER_CHECK = '/user/check' // user check
  //   static USER_EMAIL_VERIFY = '/user/verifyemail' // user email verify
  // }

  // // deposit api
  // export class DEPOSIT_PAGE {
  //   static DEPOSIT_CONFIG = '/user/depositcfg' // get user deposit configuration
  //   static DEPOSIT_SUBMIT = '/user/depositsubmit' // user deposit submit
  //   static DEPOSIT_HISTORY = '/user/deposithistory' // user deposit history
  // }

  // // withdraw api
  // export class WITHDRAW_PAGE {
  //   static WITHDRAWAL_CONFIG = '/user/withdrawalcfg' // get user withdraw configuration
  //   static WITHDRAWAL_SUBMIT = '/user/withdrawalsubmit' // user withdraw submit
  //   static WITHDRAWAL_HISTORY = '/user/withdrawalhistory' // withdrawal history
  //   static WITHDRAWAL_REFUND = '/user/withdrawalrefund' // withdrawal history
  // }

  // // invite api
  // export class INVITE_PAGE {
  //   static INVITE_INFO = '/user/invite' // get user invite information
  //   static INVITER_AWARD = '/user/invite/award' // receive invitation achievement commission
  //   static INVITE_SELF = '/user/invite/self' // personal invitation information
  //   static INVITE_HISTORY_CONFIG = '/user/invite/historycfg' // invitation event commission record configuration
  //   static INVITE_HISTORY = '/user/invite/history' // get invite history
  //   static STATISTICS_LIST = '/user/invite/statistics/list' // get agent achievement information
  // }

  // // achievement api
  // export class ACHIEVEMENT_PAGE {
  //   static ACHIEVEMENT_LIST = '/user/invite/achievement/list'
  //   static STAGE_AWARD = '/user/invite/stage/achievement/award'
  //   static ACHIEVEMENT_AWARD = '/user/invite/achievement/award'
  //   static ACHIEVEMENT_CONFIG = '/invite/achievement/config'
  // }

  // // game api
  // export class GAME_INFO {
  //   static GAME_CATEGORY = '/games/categories' // get game category
  //   static GAME_SEARCH = '/games/search' // game search
  //   static GAME_ENTER = '/user/enter/game' // game enter
  //   static GAME_BIGWIN = '/games/bigwin' // Get a list of game awards
  //   static USER_GAME = '/user/games' // user game
  //   static FAVORITE_GAME = '/user/setup/game' // favorite game
  //   static GAME_HISTORY = '/user/gamehistory' // game history
  //   static SPINPAGE = '/user/spinpage' // user spinpage
  //   static SPIN = '/user/spin' // user spin
  //   static FAVORITE_GAME_LIST = '/user/favorite/game'
  // }

  // // vip api
  // export class VIP_INFO {
  //   static USER_VIP_INFO = '/user/vipinfo' // vip info
  //   static USER_VIP_LEVEL = '/viplevels' // vip levels
  //   static VIP_TASKS = 'user/viptasks' // vip tasks
  //   static VIP_LEVEL_AWARD = '/user/viplevel/award' // vip level award
  //   static VIP_REBATE_AWARD = '/user/viprebate/award' // vip rebate award
  //   static VIP_REBATE_HISTORY = '/user/viprebatehistory' // get vip coding record
  //   static VIP_LEVEL_AWARD_HISTORY = '/user/viplevelawardhistory' // Obtain VIP level reward record
  //   static VIP_TIMES_HISTORY = '/user/viptimeshistory' // Get VIP weekly and monthly reward records
  //   static VIP_SIGNIN_REWARDS = '/user/vipsignin/award' // Receive VIP sign-in rewards
  //   // static VIP_SIGNIN = '/user/vipsignin'; // Get VIP check-in content
  //   static VIP_SIGNIN = '/user/vip/signinaward/list' // Get VIP check-in content  获取签到奖励
  //   static VIP_SIGNINAWARD_RECEIVE = '/user/vip/signinaward/receive' // Get sign-in rewards  领取签到奖励
  //   static VIP_LEVELUP_LIST = '/user/viplevelup/list' // Get VIP upgrade reward information
  //   static VIP_LEVELUP_RECEIVE = '/user/viplevelup/receive' // Receive VIP upgrade rewards
  //   static USER_VIP_CYCLEAWARD_LIST = '/user/vip/cycleaward/list' // Get periodic rewards  获取周期性奖励
  //   static USER_VIP_CYCLEAWARD_RECEIVE = '/user/vip/cycleaward/receive' // Receive periodic rewards  领取周期性奖励
  //   static USER_VIP_LEVELAWARD_LIST = '/user/vip/levelaward/list' // Get level-related rewards  获取等级相关奖励
  //   static USER_VIP_LEVELAWARD_RECEIVE = '/user/vip/levelaward/receive' // Receive level-related rewards  领取等级相关奖励
  //   static USER_VIP_BETAWARD_LIST = '/user/vip/betaward/list' // Get coding rebates  获取打码返利
  //   static USER_VIP_BETAWARD_RECEIVE = '/user/vip/betaward/receive' // Get coding rebates  领取打码返利
  // }

  // // transaction api
  // export class TRANSACTION_PAGE {
  //   static TRANSACTION_HISTORY = '/user/transactionshistory'
  // }

  // // bonus api
  // export class BONUS_PAGE {
  //   static USER_BONUS = '/user/bonuses'
  //   static BONUS_CANCEL = '/user/bonuses/cancel'
  // }

  // //Listening events sent actively
  // export class UNSOLICITED {}

  // // activity api
  // export class ACTIVITY {
  //   static USER_ACTIVITY_LIST = '/activity/list'
  // }

  // export class Reward {
  //   static REWARD_LIST = '/user/reward/center/list' // reward list
  //   static RECIEVE_ACHIV_BONUS = '/user/reward/center/invite/receive' // Acheivement Bonus
  // }

  // export class Banner {
  //   static BANNER_LIST = '/banner/list' // banner list
  // }

  // export class Currency {
  //   static CURRENCY_LIST = '/user/balance/list' // currency list
  // }
}
