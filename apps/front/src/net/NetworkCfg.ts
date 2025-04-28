//Event Macro Definition
export namespace NETWORK {
  //Login Related News
  export class LOGIN {
    static LOGIN: string = '/api/login' //Login
    static REGISTER: string = '/api/register' //Registration
  }

  //Business logic after entering the home page
  export class HOME_PAGE {
  }

  // user profile info api config group
  export class PERSONAL_INFO_PAGE {
    static USER_AMOUNT = '/api/user/amount'; // get user amount
    static USER_INFO = '/api/user/info'; // get user profile
    static USER_BALANCE = '/api/user/balance'; // get user balance
    static SET_USER_CURRENCY = '/api/user/currency'; // set user currency
    
    static USER_CHANGE = '/api/user/change'; // update user info
    static USER_EMAIL = '/api/user/email'; // update email
    static USER_PASSWORD = '/api/user/password'; // update password
    static USER_SUSPEND = '/api/user/suspend'; // suspend user
    static USER_CHECK = '/api/user/check'; // user check
    static USER_EMAIL_VERIFY = '/api/ser/verifyemail'; // user email verify
  }

  // deposit api
  export class DEPOSIT_PAGE {
    static DEPOSIT_CONFIG = '/api/user/depositcfg'; // get user deposit configuration
    static DEPOSIT_SUBMIT = '/api/user/depositsubmit'; // user deposit submit
    static DEPOSIT_HISTORY = '/api/user/deposithistory'; // user deposit history
  }

  // withdraw api
  export class WITHDRAW_PAGE {
    static WITHDRAWAL_CONFIG = '/api/user/withdrawalcfg'; // get user withdraw configuration
    static WITHDRAWAL_SUBMIT = '/api/user/withdrawalsubmit'; // user withdraw submit
    static WITHDRAWAL_HISTORY = '/api/user/withdrawalhistory'; // withdrawal history
    static WITHDRAWAL_REFUND = '/api/user/withdrawalrefund'; // withdrawal history
  }

  // invite api
  export class INVITE_PAGE {
    static INVITE_INFO = '/api/user/invite'; // get user invite information
    static INVITER_AWARD = '/api/user/invite/award'; // receive invitation achievement commission
    static INVITE_SELF = '/api/user/invite/self'; // personal invitation information
    static INVITE_HISTORY_CONFIG = '/api/user/invite/historycfg'; // invitation event commission record configuration
    static INVITE_HISTORY = '/api/user/invite/history'; // get invite history
    static STATISTICS_LIST = '/api/user/invite/statistics/list'; // get agent achievement information
  }

  // achievement api
  export class ACHIEVEMENT_PAGE {
    static ACHIEVEMENT_LIST = '/api/user/invite/achievement/list';
    static STAGE_AWARD = '/api/user/invite/stage/achievement/award';
    static ACHIEVEMENT_AWARD = '/api/user/invite/achievement/award';
    static ACHIEVEMENT_CONFIG = '/api/invite/achievement/config';
  }

  // game api
  export class GAME_INFO {
    static GAME_CATEGORY = '/api/games/categories'; // get game category
    static GAME_SEARCH = '/api/games/search'; // game search
    static GAME_ENTER = '/api/user/enter/game'; // game enter
    static GAME_BIGWIN = '/api/games/bigwin'; // Get a list of game awards
    static USER_GAME = '/api/user/games'; // user game
    static FAVORITE_GAME = '/api/user/setup/game' // favorite game
    static GAME_HISTORY = '/api/user/gamehistory' // game history
    static SPINPAGE = '/api/user/spinpage'  // user spinpage
    static SPIN = '/api/user/spin'  // user spin
    static FAVORITE_GAME_LIST = '/api/user/favorite/game';
  }

  // vip api
  export class VIP_INFO {
    static USER_VIP_INFO = '/api/user/vipinfo'; // vip info
    static USER_VIP_LEVEL = '/api/user/viplevels'; // vip levels
    static VIP_TASKS = '/api/user/viptasks'; // vip tasks
    static VIP_LEVEL_AWARD = '/api/user/viplevel/award' // vip level award
    static VIP_REBATE_AWARD = '/api/user/viprebate/award' // vip rebate award
    static VIP_REBATE_HISTORY = '/api/user/viprebatehistory' // get vip coding record
    static VIP_LEVEL_AWARD_HISTORY = '/api/user/viplevelawardhistory' // Obtain VIP level reward record
    static VIP_TIMES_HISTORY = '/api/user/viptimeshistory' // Get VIP weekly and monthly reward records
    static VIP_SIGNIN_REWARDS = '/api/user/vipsignin/award'; // Receive VIP sign-in rewards
    // static VIP_SIGNIN = '/api/user/vipsignin'; // Get VIP check-in content
    static VIP_SIGNIN = '/api/user/vip/signinaward/list';  // Get VIP check-in content  获取签到奖励
    static VIP_SIGNINAWARD_RECEIVE = '/api/user/vip/signinaward/receive';  // Get sign-in rewards  领取签到奖励
    static VIP_LEVELUP_LIST = '/api/user/viplevelup/list'; // Get VIP upgrade reward information
    static VIP_LEVELUP_RECEIVE = '/api/user/viplevelup/receive'; // Receive VIP upgrade rewards
    static USER_VIP_CYCLEAWARD_LIST = '/api/user/vip/cycleaward/list';  // Get periodic rewards  获取周期性奖励
    static USER_VIP_CYCLEAWARD_RECEIVE = '/api/user/vip/cycleaward/receive';  // Receive periodic rewards  领取周期性奖励
    static USER_VIP_LEVELAWARD_LIST = '/api/user/vip/levelaward/list';  // Get level-related rewards  获取等级相关奖励
    static USER_VIP_LEVELAWARD_RECEIVE = '/api/user/vip/levelaward/receive';  // Receive level-related rewards  领取等级相关奖励
    static USER_VIP_BETAWARD_LIST = '/api/user/vip/betaward/list';  // Get coding rebates  获取打码返利
    static USER_VIP_BETAWARD_RECEIVE = '/api/user/vip/betaward/receive';  // Get coding rebates  领取打码返利
  }

  // websocket api
  export class WEB_SOCKET {
    static SOCKET_CONNECT = '/api/user/connect/websocket'
  }

  // transaction api
  export class TRANSACTION_PAGE {
    static TRANSACTION_HISTORY = '/api/user/transactionshistory'
  }

  // bonus api
  export class BONUS_PAGE {
    static USER_BONUS = '/api/user/bonuses';
    static BONUS_CANCEL = '/api/user/bonuses/cancel'
  }

  //Listening events sent actively
  export class UNSOLICITED {}

  // activity api
  export class ACTIVITY {
    static USER_ACTIVITY_LIST = '/api/activity/list'
  }

  export class Reward{
    static REWARD_LIST = '/api/user/reward/center/list'; // reward list
    static RECIEVE_ACHIV_BONUS = '/api/user/reward/center/invite/receive'; // Acheivement Bonus
  }

  export class Banner{
    static BANNER_LIST = '/api/banner/list'; // banner list
  }

  export class Currency{
    static CURRENCY_LIST = '/api/user/balance/list'; // currency list
  }
}
