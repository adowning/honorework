// To parse this data:
//
//   import { Convert, User } from "./file";
//
//   const user = Convert.toUser(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export type User = {
  id: string
  phpid: null
  username: string
  email: string
  vipRank: UserVipRank
  age: null
  gender: string
  location: null
  accessToken: string
  password: string
  avatar: string
  isAnonymous: boolean
  dateOfBirth: Date
  phone: string
  status: string
  twoFactorEnabled: boolean
  emailVerified: boolean
  lastLogin: null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  socketID: string
  isOnline: boolean
  cashtag: string
  isStaff: boolean
  currentSessionID: string
  activeProfileID: string
  stats: string
  lastDailySpin: Date
  vipRankLevel: number
  vipInfo: VipInfo
  balance: number
  vipPoints: number
  countBalance: number
  currency: string
  isExcluded: boolean
  isActive: boolean
  faceVerificationTime: Date
  address: number
  totalCashOut: number
  totalSpins: number
  totalCashIn: number
  totalWon: number
  totalBet: number
  totalBonusWon: number
  rtp: number
  profileType: string
  limits: any[]
  xp: number
  rakeback: string
  mute: boolean
  ban: boolean
  verifiedAt: Date
  userID: string
  shopID: string
  ownerID: string
  activeUserID: string
  phpShopID: null
  purchases: any[]
  isAuthorized: boolean
}

export type VipInfo = {
  id: number
  level: number
  depositExp: number
  betExp: number
  rankBetExp: number
  rankDepositExp: number
  rankName: string
  icon: string
  expSwitchType: number
  nowDepositExp: string
  levelDepositExp: string
  nowBetExp: string
  levelBetExp: string
  telegram: string
  isProtection: boolean
  protectionDepositExp: string
  protectionDepositAmount: string
  protectionBetExp: string
  protectionBetAmount: string
  protectionDays: number
  protectionSwitch: number
  cycleAwardSwitch: boolean
  levelAwardSwitch: boolean
  signinAwardSwitch: boolean
  betAwardSwitch: boolean
  withdrawalAwardSwitch: boolean
  unprotectionDepositExp: string
  unprotectionDepositAmount: string
  unprotectionBetExp: string
  unprotectionBetAmount: string
  unprotectionDays: number
  unprotectionSwitch: number
  mainCurrency: string
  canReceiveLevelAward: boolean
  canReceiveRankAward: boolean
  canReceiveDayAward: boolean
  canReceiveWeekAward: boolean
  canReceiveMonthAward: boolean
  canReceiveSigninAward: boolean
  canReceiveBetAward: boolean
  canReceiveWithdrawalAward: boolean
  userid: string
}

export type UserVipRank = {
  data: Data
}

export type Data = {
  vipRank: DataVipRank
}

export type DataVipRank = {
  color: string
  image: string
  title: string
  rankLevel: number
  description: string
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toUser(json: string): User {
    return cast(JSON.parse(json), r('User'))
  }

  public static userToJson(value: User): string {
    return JSON.stringify(uncast(value, r('User')), null, 2)
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ)
  const parentText = parent ? ` on ${parent}` : ''
  const keyText = key ? ` for key "${key}"` : ''
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`,
  )
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a)
        })
        .join(', ')}]`
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal
  } else {
    return typeof typ
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }))
    typ.jsonToJS = map
  }
  return typ.jsonToJS
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }))
    typ.jsToJSON = map
  }
  return typ.jsToJSON
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val
    return invalidValue(typ, val, key, parent)
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length
    for (let i = 0; i < l; i++) {
      const typ = typs[i]
      try {
        return transform(val, typ, getProps)
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent)
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val
    return invalidValue(
      cases.map((a) => {
        return l(a)
      }),
      val,
      key,
      parent,
    )
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent)
    return val.map((el) => transform(el, typ, getProps))
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null
    }
    const d = new Date(val)
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent)
    }
    return d
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent)
    }
    const result: any = {}
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key]
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined
      result[prop.key] = transform(v, prop.typ, getProps, key, ref)
    })
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref)
      }
    })
    return result
  }

  if (typ === 'any') return val
  if (typ === null) {
    if (val === null) return val
    return invalidValue(typ, val, key, parent)
  }
  if (typ === false) return invalidValue(typ, val, key, parent)
  let ref: any = undefined
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref
    typ = typeMap[typ.ref]
  }
  if (Array.isArray(typ)) return transformEnum(typ, val)
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty('props')
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent)
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val)
  return transformPrimitive(typ, val)
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps)
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps)
}

function l(typ: any) {
  return { literal: typ }
}

function a(typ: any) {
  return { arrayItems: typ }
}

function u(...typs: any[]) {
  return { unionMembers: typs }
}

function o(props: any[], additional: any) {
  return { props, additional }
}

function m(additional: any) {
  return { props: [], additional }
}

function r(name: string) {
  return { ref: name }
}

const typeMap: any = {
  User: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'phpid', js: 'phpid', typ: null },
      { json: 'username', js: 'username', typ: '' },
      { json: 'email', js: 'email', typ: '' },
      { json: 'vipRank', js: 'vipRank', typ: r('UserVipRank') },
      { json: 'age', js: 'age', typ: null },
      { json: 'gender', js: 'gender', typ: '' },
      { json: 'location', js: 'location', typ: null },
      { json: 'accessToken', js: 'accessToken', typ: '' },
      { json: 'password', js: 'password', typ: '' },
      { json: 'avatar', js: 'avatar', typ: '' },
      { json: 'isAnonymous', js: 'isAnonymous', typ: true },
      { json: 'dateOfBirth', js: 'dateOfBirth', typ: Date },
      { json: 'phone', js: 'phone', typ: '' },
      { json: 'status', js: 'status', typ: '' },
      { json: 'twoFactorEnabled', js: 'twoFactorEnabled', typ: true },
      { json: 'emailVerified', js: 'emailVerified', typ: true },
      { json: 'lastLogin', js: 'lastLogin', typ: null },
      { json: 'createdAt', js: 'createdAt', typ: Date },
      { json: 'updatedAt', js: 'updatedAt', typ: Date },
      { json: 'deletedAt', js: 'deletedAt', typ: Date },
      { json: 'socketId', js: 'socketID', typ: '' },
      { json: 'isOnline', js: 'isOnline', typ: true },
      { json: 'cashtag', js: 'cashtag', typ: '' },
      { json: 'isStaff', js: 'isStaff', typ: true },
      { json: 'currentSessionId', js: 'currentSessionID', typ: '' },
      { json: 'activeProfileId', js: 'activeProfileID', typ: '' },
      { json: 'stats', js: 'stats', typ: '' },
      { json: 'lastDailySpin', js: 'lastDailySpin', typ: Date },
      { json: 'vipRankLevel', js: 'vipRankLevel', typ: 0 },
      { json: 'vipInfo', js: 'vipInfo', typ: r('VipInfo') },
      { json: 'balance', js: 'balance', typ: 0 },
      { json: 'vipPoints', js: 'vipPoints', typ: 0 },
      { json: 'countBalance', js: 'countBalance', typ: 0 },
      { json: 'currency', js: 'currency', typ: '' },
      { json: 'isExcluded', js: 'isExcluded', typ: true },
      { json: 'isActive', js: 'isActive', typ: true },
      { json: 'faceVerificationTime', js: 'faceVerificationTime', typ: Date },
      { json: 'address', js: 'address', typ: 0 },
      { json: 'totalCashOut', js: 'totalCashOut', typ: 0 },
      { json: 'totalSpins', js: 'totalSpins', typ: 0 },
      { json: 'totalCashIn', js: 'totalCashIn', typ: 0 },
      { json: 'totalWon', js: 'totalWon', typ: 0 },
      { json: 'totalBet', js: 'totalBet', typ: 0 },
      { json: 'totalBonusWon', js: 'totalBonusWon', typ: 0 },
      { json: 'rtp', js: 'rtp', typ: 0 },
      { json: 'profileType', js: 'profileType', typ: '' },
      { json: 'limits', js: 'limits', typ: a('any') },
      { json: 'xp', js: 'xp', typ: 0 },
      { json: 'rakeback', js: 'rakeback', typ: '' },
      { json: 'mute', js: 'mute', typ: true },
      { json: 'ban', js: 'ban', typ: true },
      { json: 'verifiedAt', js: 'verifiedAt', typ: Date },
      { json: 'userId', js: 'userID', typ: '' },
      { json: 'shopId', js: 'shopID', typ: '' },
      { json: 'ownerId', js: 'ownerID', typ: '' },
      { json: 'activeUserId', js: 'activeUserID', typ: '' },
      { json: 'phpShopId', js: 'phpShopID', typ: null },
      { json: 'purchases', js: 'purchases', typ: a('any') },
      { json: 'isAuthorized', js: 'isAuthorized', typ: true },
    ],
    false,
  ),
  VipInfo: o(
    [
      { json: 'id', js: 'id', typ: 0 },
      { json: 'level', js: 'level', typ: 0 },
      { json: 'deposit_exp', js: 'depositExp', typ: 0 },
      { json: 'bet_exp', js: 'betExp', typ: 0 },
      { json: 'rank_bet_exp', js: 'rankBetExp', typ: 0 },
      { json: 'rank_deposit_exp', js: 'rankDepositExp', typ: 0 },
      { json: 'rank_name', js: 'rankName', typ: '' },
      { json: 'icon', js: 'icon', typ: '' },
      { json: 'exp_switch_type', js: 'expSwitchType', typ: 0 },
      { json: 'now_deposit_exp', js: 'nowDepositExp', typ: '' },
      { json: 'level_deposit_exp', js: 'levelDepositExp', typ: '' },
      { json: 'now_bet_exp', js: 'nowBetExp', typ: '' },
      { json: 'level_bet_exp', js: 'levelBetExp', typ: '' },
      { json: 'telegram', js: 'telegram', typ: '' },
      { json: 'is_protection', js: 'isProtection', typ: true },
      { json: 'protection_deposit_exp', js: 'protectionDepositExp', typ: '' },
      { json: 'protection_deposit_amount', js: 'protectionDepositAmount', typ: '' },
      { json: 'protection_bet_exp', js: 'protectionBetExp', typ: '' },
      { json: 'protection_bet_amount', js: 'protectionBetAmount', typ: '' },
      { json: 'protection_days', js: 'protectionDays', typ: 0 },
      { json: 'protection_switch', js: 'protectionSwitch', typ: 0 },
      { json: 'cycle_award_switch', js: 'cycleAwardSwitch', typ: true },
      { json: 'level_award_switch', js: 'levelAwardSwitch', typ: true },
      { json: 'signin_award_switch', js: 'signinAwardSwitch', typ: true },
      { json: 'bet_award_switch', js: 'betAwardSwitch', typ: true },
      { json: 'withdrawal_award_switch', js: 'withdrawalAwardSwitch', typ: true },
      { json: 'unprotection_deposit_exp', js: 'unprotectionDepositExp', typ: '' },
      { json: 'unprotection_deposit_amount', js: 'unprotectionDepositAmount', typ: '' },
      { json: 'unprotection_bet_exp', js: 'unprotectionBetExp', typ: '' },
      { json: 'unprotection_bet_amount', js: 'unprotectionBetAmount', typ: '' },
      { json: 'unprotection_days', js: 'unprotectionDays', typ: 0 },
      { json: 'unprotection_switch', js: 'unprotectionSwitch', typ: 0 },
      { json: 'main_currency', js: 'mainCurrency', typ: '' },
      { json: 'can_receive_level_award', js: 'canReceiveLevelAward', typ: true },
      { json: 'can_receive_rank_award', js: 'canReceiveRankAward', typ: true },
      { json: 'can_receive_day_award', js: 'canReceiveDayAward', typ: true },
      { json: 'can_receive_week_award', js: 'canReceiveWeekAward', typ: true },
      { json: 'can_receive_month_award', js: 'canReceiveMonthAward', typ: true },
      { json: 'can_receive_signin_award', js: 'canReceiveSigninAward', typ: true },
      { json: 'can_receive_bet_award', js: 'canReceiveBetAward', typ: true },
      { json: 'can_receive_withdrawal_award', js: 'canReceiveWithdrawalAward', typ: true },
      { json: 'userid', js: 'userid', typ: '' },
    ],
    false,
  ),
  UserVipRank: o([{ json: 'data', js: 'data', typ: r('Data') }], false),
  Data: o([{ json: 'vipRank', js: 'vipRank', typ: r('DataVipRank') }], false),
  DataVipRank: o(
    [
      { json: 'color', js: 'color', typ: '' },
      { json: 'image', js: 'image', typ: '' },
      { json: 'title', js: 'title', typ: '' },
      { json: 'rankLevel', js: 'rankLevel', typ: 0 },
      { json: 'description', js: 'description', typ: '' },
    ],
    false,
  ),
}

const d = new Date()
export const guestUser: User = {
  id: 'guest',
  phpid: null,
  username: '',
  email: '',
  vipRank: {
    data: {
      vipRank: {
        color: '',
        image: '',
        title: '',
        rankLevel: 0,
        description: '',
      },
    },
  },
  age: null,
  gender: '',
  location: null,
  accessToken: '',
  password: '',
  avatar: '',
  isAnonymous: false,
  phone: '',
  status: '',
  twoFactorEnabled: false,
  emailVerified: false,
  lastLogin: null,
  socketID: '',
  isOnline: false,
  cashtag: '',
  isStaff: false,
  currentSessionID: '',
  activeProfileID: '',
  stats: '',
  vipRankLevel: 0,
  vipInfo: {
    id: 0,
    level: 0,
    depositExp: 0,
    betExp: 0,
    rankBetExp: 0,
    rankDepositExp: 0,
    rankName: '',
    icon: '',
    expSwitchType: 0,
    nowDepositExp: '',
    levelDepositExp: '',
    nowBetExp: '',
    levelBetExp: '',
    telegram: '',
    isProtection: false,
    protectionDepositExp: '',
    protectionDepositAmount: '',
    protectionBetExp: '',
    protectionBetAmount: '',
    protectionDays: 0,
    protectionSwitch: 0,
    cycleAwardSwitch: false,
    levelAwardSwitch: false,
    signinAwardSwitch: false,
    betAwardSwitch: false,
    withdrawalAwardSwitch: false,
    unprotectionDepositExp: '',
    unprotectionDepositAmount: '',
    unprotectionBetExp: '',
    unprotectionBetAmount: '',
    unprotectionDays: 0,
    unprotectionSwitch: 0,
    mainCurrency: '',
    canReceiveLevelAward: false,
    canReceiveRankAward: false,
    canReceiveDayAward: false,
    canReceiveWeekAward: false,
    canReceiveMonthAward: false,
    canReceiveSigninAward: false,
    canReceiveBetAward: false,
    canReceiveWithdrawalAward: false,
    userid: '',
  },
  balance: 0,
  vipPoints: 0,
  countBalance: 0,
  currency: '',
  isExcluded: false,
  isActive: false,
  address: 0,
  totalCashOut: 0,
  totalSpins: 0,
  totalCashIn: 0,
  totalWon: 0,
  totalBet: 0,
  totalBonusWon: 0,
  rtp: 0,
  profileType: '',
  limits: [],
  xp: 0,
  rakeback: '',
  mute: false,
  ban: false,
  userID: '',
  shopID: '',
  ownerID: '',
  activeUserID: '',
  phpShopID: null,
  purchases: [],
  isAuthorized: false,
  dateOfBirth: d,
  createdAt: d,
  updatedAt: d,
  deletedAt: d,
  lastDailySpin: d,
  faceVerificationTime: d,
  verifiedAt: d,
}
