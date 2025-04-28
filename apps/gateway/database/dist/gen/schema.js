import { relations } from 'drizzle-orm';
import { boolean, decimal, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
export const ChatChannel = pgEnum('ChatChannel', ['LOBBY', 'GAME', 'TOURNAMENT', 'PRIVATE']);
export const FriendshipStatus = pgEnum('FriendshipStatus', ['PENDING', 'ACCEPTED', 'BLOCKED']);
export const Gender = pgEnum('Gender', ['BOY', 'GIRL', 'ALIEN', 'UNSURE', 'ROBOT', 'COMPLICATED']);
export const NotificationType = pgEnum('NotificationType', ['SYSTEM', 'FRIEND_REQUEST', 'ACHIEVEMENT', 'BALANCE_UPDATE', 'PROMOTIONAL', 'TOURNAMENT']);
export const TransactionStatus = pgEnum('TransactionStatus', ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']);
export const TransactionType = pgEnum('TransactionType', ['DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS', 'DONATION', 'ADJUSTMENT', 'TOURNAMENT_BUYIN', 'TOURNAMENT_PRIZE']);
export const UserStatus = pgEnum('UserStatus', ['ACTIVE', 'INACTIVE', 'ONLINE', 'OFFLINE']);
export const achievement = pgTable('achievement', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    targetXp: integer('targetXp').notNull(),
    reward: decimal('reward', { precision: 65, scale: 30 }),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull()
});
export const bank = pgTable('bank', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    currency: text('currency').notNull().default("USD"),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    operatorId: text('operatorId').notNull()
}, (bank) => ({
    'bank_operator_fkey': foreignKey({
        name: 'bank_operator_fkey',
        columns: [bank.operatorId],
        foreignColumns: [operator.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'bank_operatorId_name_unique_idx': uniqueIndex('bank_operatorId_name_key')
        .on(bank.operatorId, bank.name)
}));
export const chatmessage = pgTable('chatmessage', {
    id: text('id').notNull().primaryKey(),
    content: text('content').notNull(),
    channel: ChatChannel('channel').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    userId: text('userId').notNull(),
    roomId: text('roomId')
}, (chatmessage) => ({
    'chatmessage_chatroom_fkey': foreignKey({
        name: 'chatmessage_chatroom_fkey',
        columns: [chatmessage.roomId],
        foreignColumns: [chatroom.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'chatmessage_user_fkey': foreignKey({
        name: 'chatmessage_user_fkey',
        columns: [chatmessage.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const chatroom = pgTable('chatroom', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    isGameRoom: boolean('isGameRoom').notNull(),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    gameSessionId: text('gameSessionId')
}, (chatroom) => ({
    'chatroom_gamesession_fkey': foreignKey({
        name: 'chatroom_gamesession_fkey',
        columns: [chatroom.gameSessionId],
        foreignColumns: [gamesession.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const friendship = pgTable('friendship', {
    id: text('id').notNull().primaryKey(),
    status: FriendshipStatus('status').notNull().default("PENDING"),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
    userId: text('userId').notNull(),
    friendId: text('friendId').notNull()
}, (friendship) => ({
    'friendship_user_friendship_friendIdTouser_fkey': foreignKey({
        name: 'friendship_user_friendship_friendIdTouser_fkey',
        columns: [friendship.friendId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'friendship_user_friendship_userIdTouser_fkey': foreignKey({
        name: 'friendship_user_friendship_userIdTouser_fkey',
        columns: [friendship.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'friendship_userId_friendId_unique_idx': uniqueIndex('friendship_userId_friendId_key')
        .on(friendship.userId, friendship.friendId)
}));
export const gamesession = pgTable('gamesession', {
    id: text('id').notNull().primaryKey(),
    startTime: timestamp('startTime', { precision: 3 }).notNull().defaultNow(),
    endTime: timestamp('endTime', { precision: 3 }),
    betAmount: decimal('betAmount', { precision: 65, scale: 30 }),
    winAmount: decimal('winAmount', { precision: 65, scale: 30 }),
    xpEarned: integer('xpEarned').notNull(),
    metadata: jsonb('metadata'),
    gameId: text('gameId').notNull(),
    tournamentId: text('tournamentId'),
    active: boolean('active').notNull(),
    profileId: text('profileId').notNull()
}, (gamesession) => ({
    'gamesession_operatorgame_fkey': foreignKey({
        name: 'gamesession_operatorgame_fkey',
        columns: [gamesession.gameId],
        foreignColumns: [operatorgame.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'gamesession_profile_fkey': foreignKey({
        name: 'gamesession_profile_fkey',
        columns: [gamesession.profileId],
        foreignColumns: [profile.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'gamesession_tournament_fkey': foreignKey({
        name: 'gamesession_tournament_fkey',
        columns: [gamesession.tournamentId],
        foreignColumns: [tournament.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const notification = pgTable('notification', {
    id: text('id').notNull().primaryKey(),
    type: NotificationType('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    isRead: boolean('isRead').notNull(),
    readAt: timestamp('readAt', { precision: 3 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    userId: text('userId').notNull()
}, (notification) => ({
    'notification_user_fkey': foreignKey({
        name: 'notification_user_fkey',
        columns: [notification.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const operator = pgTable('operator', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    description: text('description'),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
    ownerId: text('ownerId').notNull()
}, (operator) => ({
    'operator_user_fkey': foreignKey({
        name: 'operator_user_fkey',
        columns: [operator.ownerId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const operatorgame = pgTable('operatorgame', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    thumbnail: text('thumbnail'),
    minBet: decimal('minBet', { precision: 65, scale: 30 }),
    maxBet: decimal('maxBet', { precision: 65, scale: 30 }),
    xpMultiplier: doublePrecision('xpMultiplier').notNull().default(1),
    isActive: boolean('isActive').notNull().default(true),
    isPromoted: boolean('isPromoted').notNull(),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
    operatorId: text('operatorId').notNull()
}, (operatorgame) => ({
    'operatorgame_operator_fkey': foreignKey({
        name: 'operatorgame_operator_fkey',
        columns: [operatorgame.operatorId],
        foreignColumns: [operator.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const profile = pgTable('profile', {
    id: text('id').notNull().primaryKey(),
    profileNumber: text('profileNumber').notNull().unique(),
    balance: integer('balance').notNull(),
    xpEarned: integer('xpEarned').notNull(),
    isActive: boolean('isActive').notNull(),
    lastPlayed: timestamp('lastPlayed', { precision: 3 }),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
    phpId: integer('phpId').unique(),
    userId: text('userId').notNull(),
    bankId: text('bankId').notNull(),
    shopId: text('shopId').notNull()
}, (profile) => ({
    'profile_bank_fkey': foreignKey({
        name: 'profile_bank_fkey',
        columns: [profile.bankId],
        foreignColumns: [bank.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'profile_operator_fkey': foreignKey({
        name: 'profile_operator_fkey',
        columns: [profile.shopId],
        foreignColumns: [operator.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'profile_user_profile_userIdTouser_fkey': foreignKey({
        name: 'profile_user_profile_userIdTouser_fkey',
        columns: [profile.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'profile_userId_shopId_unique_idx': uniqueIndex('profile_userId_shopId_key')
        .on(profile.userId, profile.shopId)
}));
export const session = pgTable('session', {
    id: text('id').notNull().primaryKey(),
    userId: text('userId').notNull(),
    activeGameId: text('activeGameId'),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    expiresAt: timestamp('expiresAt', { precision: 3 }).notNull(),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    refreshToken: text('refreshToken').notNull().unique(),
    active: boolean('active').notNull()
}, (session) => ({
    'session_user_fkey': foreignKey({
        name: 'session_user_fkey',
        columns: [session.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const tournament = pgTable('tournament', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    startTime: timestamp('startTime', { precision: 3 }).notNull(),
    endTime: timestamp('endTime', { precision: 3 }).notNull(),
    entryFee: decimal('entryFee', { precision: 65, scale: 30 }),
    prizePool: decimal('prizePool', { precision: 65, scale: 30 }).notNull(),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
    operatorId: text('operatorId').notNull(),
    leaderboard: jsonb('leaderboard')
}, (tournament) => ({
    'tournament_operator_fkey': foreignKey({
        name: 'tournament_operator_fkey',
        columns: [tournament.operatorId],
        foreignColumns: [operator.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const tournamententry = pgTable('tournamententry', {
    id: text('id').notNull().primaryKey(),
    score: integer('score').notNull(),
    wagered: decimal('wagered', { precision: 65, scale: 30 }).notNull(),
    won: decimal('won', { precision: 65, scale: 30 }).notNull(),
    joinedAt: timestamp('joinedAt', { precision: 3 }).notNull().defaultNow(),
    userId: text('userId').notNull(),
    tournamentId: text('tournamentId').notNull(),
    profileId: text('profileId').notNull()
}, (tournamententry) => ({
    'tournamententry_profile_fkey': foreignKey({
        name: 'tournamententry_profile_fkey',
        columns: [tournamententry.profileId],
        foreignColumns: [profile.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'tournamententry_tournament_fkey': foreignKey({
        name: 'tournamententry_tournament_fkey',
        columns: [tournamententry.tournamentId],
        foreignColumns: [tournament.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'tournamententry_user_fkey': foreignKey({
        name: 'tournamententry_user_fkey',
        columns: [tournamententry.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'tournamententry_userId_tournamentId_unique_idx': uniqueIndex('tournamententry_userId_tournamentId_key')
        .on(tournamententry.userId, tournamententry.tournamentId)
}));
export const tournamentgame = pgTable('tournamentgame', {
    id: text('id').notNull().primaryKey(),
    multiplier: doublePrecision('multiplier').notNull().default(1),
    tournamentId: text('tournamentId').notNull(),
    gameId: text('gameId').notNull()
}, (tournamentgame) => ({
    'tournamentgame_operatorgame_fkey': foreignKey({
        name: 'tournamentgame_operatorgame_fkey',
        columns: [tournamentgame.gameId],
        foreignColumns: [operatorgame.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'tournamentgame_tournament_fkey': foreignKey({
        name: 'tournamentgame_tournament_fkey',
        columns: [tournamentgame.tournamentId],
        foreignColumns: [tournament.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'tournamentgame_tournamentId_gameId_unique_idx': uniqueIndex('tournamentgame_tournamentId_gameId_key')
        .on(tournamentgame.tournamentId, tournamentgame.gameId)
}));
export const transaction = pgTable('transaction', {
    id: text('id').notNull().primaryKey(),
    type: TransactionType('type').notNull(),
    amount: decimal('amount', { precision: 65, scale: 30 }).notNull(),
    reference: text('reference'),
    status: TransactionStatus('status').notNull().default("PENDING"),
    metadata: jsonb('metadata'),
    isRealMoney: boolean('isRealMoney').notNull(),
    paymentMethod: text('paymentMethod'),
    paymentDetails: jsonb('paymentDetails'),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    processedAt: timestamp('processedAt', { precision: 3 }),
    gameSessionId: text('gameSessionId'),
    profileId: text('profileId').notNull()
}, (transaction) => ({
    'transaction_gamesession_fkey': foreignKey({
        name: 'transaction_gamesession_fkey',
        columns: [transaction.gameSessionId],
        foreignColumns: [gamesession.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'transaction_profile_fkey': foreignKey({
        name: 'transaction_profile_fkey',
        columns: [transaction.profileId],
        foreignColumns: [profile.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const user = pgTable('user', {
    id: text('id').notNull().primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    passwordHash: text('passwordHash').notNull(),
    avatar: text('avatar'),
    totalXp: integer('totalXp').notNull(),
    balance: decimal('balance', { precision: 65, scale: 30 }).notNull(),
    lastLogin: timestamp('lastLogin', { precision: 3 }),
    isVerified: boolean('isVerified').notNull(),
    verificationToken: text('verificationToken'),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
    active: boolean('active').notNull(),
    activeProfileId: text('activeProfileId').unique(),
    gender: Gender('gender'),
    status: UserStatus('status'),
    cashtag: text('cashtag'),
    phpId: integer('phpId'),
    accessToken: text('accessToken')
});
export const userachievement = pgTable('userachievement', {
    id: text('id').notNull().primaryKey(),
    progress: integer('progress').notNull(),
    isUnlocked: boolean('isUnlocked').notNull(),
    unlockedAt: timestamp('unlockedAt', { precision: 3 }),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
    userId: text('userId').notNull(),
    achievementId: text('achievementId').notNull()
}, (userachievement) => ({
    'userachievement_achievement_fkey': foreignKey({
        name: 'userachievement_achievement_fkey',
        columns: [userachievement.achievementId],
        foreignColumns: [achievement.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'userachievement_user_fkey': foreignKey({
        name: 'userachievement_user_fkey',
        columns: [userachievement.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'userachievement_userId_achievementId_unique_idx': uniqueIndex('userachievement_userId_achievementId_key')
        .on(userachievement.userId, userachievement.achievementId)
}));
export const RainBet = pgTable('RainBet', {
    id: text('id').notNull().primaryKey(),
    rainHistoryId: text('rainHistoryId').notNull(),
    userId: text('userId').notNull(),
    betAmount: decimal('betAmount', { precision: 65, scale: 30 }).notNull(),
    odds: decimal('odds', { precision: 65, scale: 30 }).notNull(),
    outcome: text('outcome'),
    settledAt: timestamp('settledAt', { precision: 3 })
}, (RainBet) => ({
    'RainBet_RainHistory_fkey': foreignKey({
        name: 'RainBet_RainHistory_fkey',
        columns: [RainBet.rainHistoryId],
        foreignColumns: [RainHistory.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'RainBet_user_fkey': foreignKey({
        name: 'RainBet_user_fkey',
        columns: [RainBet.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const RainHistory = pgTable('RainHistory', {
    id: text('id').notNull().primaryKey(),
    userId: text('userId').notNull(),
    amount: decimal('amount', { precision: 65, scale: 30 }).notNull(),
    rainType: text('rainType').notNull(),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow()
}, (RainHistory) => ({
    'RainHistory_user_fkey': foreignKey({
        name: 'RainHistory_user_fkey',
        columns: [RainHistory.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const RainTip = pgTable('RainTip', {
    id: text('id').notNull().primaryKey(),
    rainHistoryId: text('rainHistoryId').notNull(),
    userId: text('userId').notNull(),
    tipAmount: decimal('tipAmount', { precision: 65, scale: 30 }).notNull(),
    tippedAt: timestamp('tippedAt', { precision: 3 }).notNull().defaultNow()
}, (RainTip) => ({
    'RainTip_RainHistory_fkey': foreignKey({
        name: 'RainTip_RainHistory_fkey',
        columns: [RainTip.rainHistoryId],
        foreignColumns: [RainHistory.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'RainTip_user_fkey': foreignKey({
        name: 'RainTip_user_fkey',
        columns: [RainTip.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const RainWinner = pgTable('RainWinner', {
    id: text('id').notNull().primaryKey(),
    rainHistoryId: text('rainHistoryId').notNull(),
    userId: text('userId').notNull(),
    wonAmount: decimal('wonAmount', { precision: 65, scale: 30 }).notNull(),
    wonAt: timestamp('wonAt', { precision: 3 }).notNull().defaultNow()
}, (RainWinner) => ({
    'RainWinner_RainHistory_fkey': foreignKey({
        name: 'RainWinner_RainHistory_fkey',
        columns: [RainWinner.rainHistoryId],
        foreignColumns: [RainHistory.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade'),
    'RainWinner_user_fkey': foreignKey({
        name: 'RainWinner_user_fkey',
        columns: [RainWinner.userId],
        foreignColumns: [user.id]
    })
        .onDelete('cascade')
        .onUpdate('cascade')
}));
export const achievementRelations = relations(achievement, ({ many }) => ({
    userachievement: many(userachievement, {
        relationName: 'achievementTouserachievement'
    })
}));
export const bankRelations = relations(bank, ({ one, many }) => ({
    operator: one(operator, {
        relationName: 'bankTooperator',
        fields: [bank.operatorId],
        references: [operator.id]
    }),
    profile: many(profile, {
        relationName: 'bankToprofile'
    })
}));
export const chatmessageRelations = relations(chatmessage, ({ one }) => ({
    chatroom: one(chatroom, {
        relationName: 'chatmessageTochatroom',
        fields: [chatmessage.roomId],
        references: [chatroom.id]
    }),
    user: one(user, {
        relationName: 'chatmessageTouser',
        fields: [chatmessage.userId],
        references: [user.id]
    })
}));
export const chatroomRelations = relations(chatroom, ({ many, one }) => ({
    chatmessage: many(chatmessage, {
        relationName: 'chatmessageTochatroom'
    }),
    gamesession: one(gamesession, {
        relationName: 'chatroomTogamesession',
        fields: [chatroom.gameSessionId],
        references: [gamesession.id]
    })
}));
export const friendshipRelations = relations(friendship, ({ one }) => ({
    user_friendship_friendIdTouser: one(user, {
        relationName: 'friendship_friendIdTouser',
        fields: [friendship.friendId],
        references: [user.id]
    }),
    user_friendship_userIdTouser: one(user, {
        relationName: 'friendship_userIdTouser',
        fields: [friendship.userId],
        references: [user.id]
    })
}));
export const gamesessionRelations = relations(gamesession, ({ many, one }) => ({
    chatroom: many(chatroom, {
        relationName: 'chatroomTogamesession'
    }),
    operatorgame: one(operatorgame, {
        relationName: 'gamesessionTooperatorgame',
        fields: [gamesession.gameId],
        references: [operatorgame.id]
    }),
    profile: one(profile, {
        relationName: 'gamesessionToprofile',
        fields: [gamesession.profileId],
        references: [profile.id]
    }),
    tournament: one(tournament, {
        relationName: 'gamesessionTotournament',
        fields: [gamesession.tournamentId],
        references: [tournament.id]
    }),
    transaction: many(transaction, {
        relationName: 'gamesessionTotransaction'
    })
}));
export const notificationRelations = relations(notification, ({ one }) => ({
    user: one(user, {
        relationName: 'notificationTouser',
        fields: [notification.userId],
        references: [user.id]
    })
}));
export const operatorRelations = relations(operator, ({ many, one }) => ({
    bank: many(bank, {
        relationName: 'bankTooperator'
    }),
    user: one(user, {
        relationName: 'operatorTouser',
        fields: [operator.ownerId],
        references: [user.id]
    }),
    operatorgame: many(operatorgame, {
        relationName: 'operatorTooperatorgame'
    }),
    profile: many(profile, {
        relationName: 'operatorToprofile'
    }),
    tournament: many(tournament, {
        relationName: 'operatorTotournament'
    })
}));
export const operatorgameRelations = relations(operatorgame, ({ many, one }) => ({
    gamesession: many(gamesession, {
        relationName: 'gamesessionTooperatorgame'
    }),
    operator: one(operator, {
        relationName: 'operatorTooperatorgame',
        fields: [operatorgame.operatorId],
        references: [operator.id]
    }),
    tournamentgame: many(tournamentgame, {
        relationName: 'operatorgameTotournamentgame'
    })
}));
export const profileRelations = relations(profile, ({ many, one }) => ({
    gamesession: many(gamesession, {
        relationName: 'gamesessionToprofile'
    }),
    bank: one(bank, {
        relationName: 'bankToprofile',
        fields: [profile.bankId],
        references: [bank.id]
    }),
    operator: one(operator, {
        relationName: 'operatorToprofile',
        fields: [profile.shopId],
        references: [operator.id]
    }),
    user_profile_userIdTouser: one(user, {
        relationName: 'profile_userIdTouser',
        fields: [profile.userId],
        references: [user.id]
    }),
    tournamententry: many(tournamententry, {
        relationName: 'profileTotournamententry'
    }),
    transaction: many(transaction, {
        relationName: 'profileTotransaction'
    })
}));
export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        relationName: 'sessionTouser',
        fields: [session.userId],
        references: [user.id]
    })
}));
export const tournamentRelations = relations(tournament, ({ many, one }) => ({
    gamesession: many(gamesession, {
        relationName: 'gamesessionTotournament'
    }),
    operator: one(operator, {
        relationName: 'operatorTotournament',
        fields: [tournament.operatorId],
        references: [operator.id]
    }),
    tournamententry: many(tournamententry, {
        relationName: 'tournamentTotournamententry'
    }),
    tournamentgame: many(tournamentgame, {
        relationName: 'tournamentTotournamentgame'
    })
}));
export const tournamententryRelations = relations(tournamententry, ({ one }) => ({
    profile: one(profile, {
        relationName: 'profileTotournamententry',
        fields: [tournamententry.profileId],
        references: [profile.id]
    }),
    tournament: one(tournament, {
        relationName: 'tournamentTotournamententry',
        fields: [tournamententry.tournamentId],
        references: [tournament.id]
    }),
    user: one(user, {
        relationName: 'tournamententryTouser',
        fields: [tournamententry.userId],
        references: [user.id]
    })
}));
export const tournamentgameRelations = relations(tournamentgame, ({ one }) => ({
    operatorgame: one(operatorgame, {
        relationName: 'operatorgameTotournamentgame',
        fields: [tournamentgame.gameId],
        references: [operatorgame.id]
    }),
    tournament: one(tournament, {
        relationName: 'tournamentTotournamentgame',
        fields: [tournamentgame.tournamentId],
        references: [tournament.id]
    })
}));
export const transactionRelations = relations(transaction, ({ one }) => ({
    gamesession: one(gamesession, {
        relationName: 'gamesessionTotransaction',
        fields: [transaction.gameSessionId],
        references: [gamesession.id]
    }),
    profile: one(profile, {
        relationName: 'profileTotransaction',
        fields: [transaction.profileId],
        references: [profile.id]
    })
}));
export const userRelations = relations(user, ({ many }) => ({
    RainBet: many(RainBet, {
        relationName: 'RainBetTouser'
    }),
    RainHistory: many(RainHistory, {
        relationName: 'RainHistoryTouser'
    }),
    RainTip: many(RainTip, {
        relationName: 'RainTipTouser'
    }),
    RainWinner: many(RainWinner, {
        relationName: 'RainWinnerTouser'
    }),
    chatmessage: many(chatmessage, {
        relationName: 'chatmessageTouser'
    }),
    friendship_friendship_friendIdTouser: many(friendship, {
        relationName: 'friendship_friendIdTouser'
    }),
    friendship_friendship_userIdTouser: many(friendship, {
        relationName: 'friendship_userIdTouser'
    }),
    notification: many(notification, {
        relationName: 'notificationTouser'
    }),
    operator: many(operator, {
        relationName: 'operatorTouser'
    }),
    profile_profile_userIdTouser: many(profile, {
        relationName: 'profile_userIdTouser'
    }),
    session: many(session, {
        relationName: 'sessionTouser'
    }),
    tournamententry: many(tournamententry, {
        relationName: 'tournamententryTouser'
    }),
    userachievement: many(userachievement, {
        relationName: 'userTouserachievement'
    })
}));
export const userachievementRelations = relations(userachievement, ({ one }) => ({
    achievement: one(achievement, {
        relationName: 'achievementTouserachievement',
        fields: [userachievement.achievementId],
        references: [achievement.id]
    }),
    user: one(user, {
        relationName: 'userTouserachievement',
        fields: [userachievement.userId],
        references: [user.id]
    })
}));
export const RainBetRelations = relations(RainBet, ({ one }) => ({
    RainHistory: one(RainHistory, {
        relationName: 'RainBetToRainHistory',
        fields: [RainBet.rainHistoryId],
        references: [RainHistory.id]
    }),
    user: one(user, {
        relationName: 'RainBetTouser',
        fields: [RainBet.userId],
        references: [user.id]
    })
}));
export const RainHistoryRelations = relations(RainHistory, ({ many, one }) => ({
    RainBet: many(RainBet, {
        relationName: 'RainBetToRainHistory'
    }),
    user: one(user, {
        relationName: 'RainHistoryTouser',
        fields: [RainHistory.userId],
        references: [user.id]
    }),
    RainTip: many(RainTip, {
        relationName: 'RainHistoryToRainTip'
    }),
    RainWinner: many(RainWinner, {
        relationName: 'RainHistoryToRainWinner'
    })
}));
export const RainTipRelations = relations(RainTip, ({ one }) => ({
    RainHistory: one(RainHistory, {
        relationName: 'RainHistoryToRainTip',
        fields: [RainTip.rainHistoryId],
        references: [RainHistory.id]
    }),
    user: one(user, {
        relationName: 'RainTipTouser',
        fields: [RainTip.userId],
        references: [user.id]
    })
}));
export const RainWinnerRelations = relations(RainWinner, ({ one }) => ({
    RainHistory: one(RainHistory, {
        relationName: 'RainHistoryToRainWinner',
        fields: [RainWinner.rainHistoryId],
        references: [RainHistory.id]
    }),
    user: one(user, {
        relationName: 'RainWinnerTouser',
        fields: [RainWinner.userId],
        references: [user.id]
    })
}));
