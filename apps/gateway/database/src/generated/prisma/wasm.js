
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AchievementScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  targetXp: 'targetXp',
  reward: 'reward',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BankScalarFieldEnum = {
  id: 'id',
  name: 'name',
  currency: 'currency',
  isActive: 'isActive',
  createdAt: 'createdAt',
  operatorId: 'operatorId'
};

exports.Prisma.ChatmessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  channel: 'channel',
  metadata: 'metadata',
  createdAt: 'createdAt',
  userId: 'userId',
  roomId: 'roomId'
};

exports.Prisma.ChatroomScalarFieldEnum = {
  id: 'id',
  name: 'name',
  isGameRoom: 'isGameRoom',
  createdAt: 'createdAt',
  gameSessionId: 'gameSessionId'
};

exports.Prisma.FriendshipScalarFieldEnum = {
  id: 'id',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  friendId: 'friendId'
};

exports.Prisma.GamesessionScalarFieldEnum = {
  id: 'id',
  startTime: 'startTime',
  endTime: 'endTime',
  betAmount: 'betAmount',
  winAmount: 'winAmount',
  xpEarned: 'xpEarned',
  metadata: 'metadata',
  gameId: 'gameId',
  tournamentId: 'tournamentId',
  active: 'active',
  profileId: 'profileId'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  message: 'message',
  isRead: 'isRead',
  readAt: 'readAt',
  metadata: 'metadata',
  createdAt: 'createdAt',
  userId: 'userId'
};

exports.Prisma.OperatorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  logo: 'logo',
  description: 'description',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ownerId: 'ownerId'
};

exports.Prisma.OperatorgameScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  thumbnail: 'thumbnail',
  minBet: 'minBet',
  maxBet: 'maxBet',
  xpMultiplier: 'xpMultiplier',
  isActive: 'isActive',
  isPromoted: 'isPromoted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  operatorId: 'operatorId'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  profileNumber: 'profileNumber',
  balance: 'balance',
  xpEarned: 'xpEarned',
  isActive: 'isActive',
  lastPlayed: 'lastPlayed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  phpId: 'phpId',
  userId: 'userId',
  bankId: 'bankId',
  shopId: 'shopId'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  activeGameId: 'activeGameId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  refreshToken: 'refreshToken',
  active: 'active'
};

exports.Prisma.TournamentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  startTime: 'startTime',
  endTime: 'endTime',
  entryFee: 'entryFee',
  prizePool: 'prizePool',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  operatorId: 'operatorId',
  leaderboard: 'leaderboard'
};

exports.Prisma.TournamententryScalarFieldEnum = {
  id: 'id',
  score: 'score',
  wagered: 'wagered',
  won: 'won',
  joinedAt: 'joinedAt',
  userId: 'userId',
  tournamentId: 'tournamentId',
  profileId: 'profileId'
};

exports.Prisma.TournamentgameScalarFieldEnum = {
  id: 'id',
  multiplier: 'multiplier',
  tournamentId: 'tournamentId',
  gameId: 'gameId'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  reference: 'reference',
  status: 'status',
  metadata: 'metadata',
  isRealMoney: 'isRealMoney',
  paymentMethod: 'paymentMethod',
  paymentDetails: 'paymentDetails',
  createdAt: 'createdAt',
  processedAt: 'processedAt',
  gameSessionId: 'gameSessionId',
  profileId: 'profileId'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  email: 'email',
  passwordHash: 'passwordHash',
  avatar: 'avatar',
  totalXp: 'totalXp',
  balance: 'balance',
  lastLogin: 'lastLogin',
  isVerified: 'isVerified',
  verificationToken: 'verificationToken',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  active: 'active',
  activeProfileId: 'activeProfileId',
  gender: 'gender',
  status: 'status',
  cashtag: 'cashtag',
  phpId: 'phpId',
  accessToken: 'accessToken'
};

exports.Prisma.UserachievementScalarFieldEnum = {
  id: 'id',
  progress: 'progress',
  isUnlocked: 'isUnlocked',
  unlockedAt: 'unlockedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  achievementId: 'achievementId'
};

exports.Prisma.RainBetScalarFieldEnum = {
  id: 'id',
  rainHistoryId: 'rainHistoryId',
  userId: 'userId',
  betAmount: 'betAmount',
  odds: 'odds',
  outcome: 'outcome',
  settledAt: 'settledAt'
};

exports.Prisma.RainHistoryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  amount: 'amount',
  rainType: 'rainType',
  createdAt: 'createdAt'
};

exports.Prisma.RainTipScalarFieldEnum = {
  id: 'id',
  rainHistoryId: 'rainHistoryId',
  userId: 'userId',
  tipAmount: 'tipAmount',
  tippedAt: 'tippedAt'
};

exports.Prisma.RainWinnerScalarFieldEnum = {
  id: 'id',
  rainHistoryId: 'rainHistoryId',
  userId: 'userId',
  wonAmount: 'wonAmount',
  wonAt: 'wonAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.ChatChannel = exports.$Enums.ChatChannel = {
  LOBBY: 'LOBBY',
  GAME: 'GAME',
  TOURNAMENT: 'TOURNAMENT',
  PRIVATE: 'PRIVATE'
};

exports.FriendshipStatus = exports.$Enums.FriendshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  BLOCKED: 'BLOCKED'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  SYSTEM: 'SYSTEM',
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  ACHIEVEMENT: 'ACHIEVEMENT',
  BALANCE_UPDATE: 'BALANCE_UPDATE',
  PROMOTIONAL: 'PROMOTIONAL',
  TOURNAMENT: 'TOURNAMENT'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  BET: 'BET',
  WIN: 'WIN',
  BONUS: 'BONUS',
  DONATION: 'DONATION',
  ADJUSTMENT: 'ADJUSTMENT',
  TOURNAMENT_BUYIN: 'TOURNAMENT_BUYIN',
  TOURNAMENT_PRIZE: 'TOURNAMENT_PRIZE'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

exports.Gender = exports.$Enums.Gender = {
  BOY: 'BOY',
  GIRL: 'GIRL',
  ALIEN: 'ALIEN',
  UNSURE: 'UNSURE',
  ROBOT: 'ROBOT',
  COMPLICATED: 'COMPLICATED'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE'
};

exports.Prisma.ModelName = {
  achievement: 'achievement',
  bank: 'bank',
  chatmessage: 'chatmessage',
  chatroom: 'chatroom',
  friendship: 'friendship',
  gamesession: 'gamesession',
  notification: 'notification',
  operator: 'operator',
  operatorgame: 'operatorgame',
  profile: 'profile',
  session: 'session',
  tournament: 'tournament',
  tournamententry: 'tournamententry',
  tournamentgame: 'tournamentgame',
  transaction: 'transaction',
  user: 'user',
  userachievement: 'userachievement',
  RainBet: 'RainBet',
  RainHistory: 'RainHistory',
  RainTip: 'RainTip',
  RainWinner: 'RainWinner'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
