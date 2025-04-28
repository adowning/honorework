import { pgTable, uniqueIndex, index, foreignKey, text, boolean, timestamp, jsonb, numeric, doublePrecision, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
export const chatChannel = pgEnum("ChatChannel", ['LOBBY', 'GAME', 'TOURNAMENT', 'PRIVATE']);
export const friendshipStatus = pgEnum("FriendshipStatus", ['PENDING', 'ACCEPTED', 'BLOCKED']);
export const gender = pgEnum("Gender", ['BOY', 'GIRL', 'ALIEN', 'UNSURE', 'ROBOT', 'COMPLICATED']);
export const notificationType = pgEnum("NotificationType", ['SYSTEM', 'FRIEND_REQUEST', 'ACHIEVEMENT', 'BALANCE_UPDATE', 'PROMOTIONAL', 'TOURNAMENT']);
export const transactionStatus = pgEnum("TransactionStatus", ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']);
export const transactionType = pgEnum("TransactionType", ['DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS', 'DONATION', 'ADJUSTMENT', 'TOURNAMENT_BUYIN', 'TOURNAMENT_PRIZE']);
export const userStatus = pgEnum("UserStatus", ['ACTIVE', 'INACTIVE', 'ONLINE', 'OFFLINE']);
export const operator = pgTable("operator", {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    logo: text(),
    description: text(),
    isActive: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    ownerId: text().notNull(),
}, (table) => [
    uniqueIndex("Operator_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
    index("operator_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.ownerId],
        foreignColumns: [user.id],
        name: "Operator_ownerId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const bank = pgTable("bank", {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    currency: text().default('USD').notNull(),
    isActive: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    operatorId: text().notNull(),
}, (table) => [
    uniqueIndex("Bank_operatorId_name_key").using("btree", table.operatorId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.operatorId],
        foreignColumns: [operator.id],
        name: "Bank_operatorId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const chatmessage = pgTable("chatmessage", {
    id: text().primaryKey().notNull(),
    content: text().notNull(),
    channel: chatChannel().notNull(),
    metadata: jsonb(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    userId: text().notNull(),
    roomId: text(),
}, (table) => [
    index("chat_channel_idx").using("btree", table.channel.asc().nullsLast().op("enum_ops")),
    index("chat_room_idx").using("btree", table.roomId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "ChatMessage_userId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    foreignKey({
        columns: [table.roomId],
        foreignColumns: [chatroom.id],
        name: "ChatMessage_roomId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
export const operatorgame = pgTable("operatorgame", {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    thumbnail: text(),
    minBet: numeric({ precision: 65, scale: 30 }),
    maxBet: numeric({ precision: 65, scale: 30 }),
    xpMultiplier: doublePrecision().default(1).notNull(),
    isActive: boolean().default(true).notNull(),
    isPromoted: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    operatorId: text().notNull(),
}, (table) => [
    uniqueIndex("OperatorGame_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
    index("game_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.operatorId],
        foreignColumns: [operator.id],
        name: "OperatorGame_operatorId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const gamesession = pgTable("gamesession", {
    id: text().primaryKey().notNull(),
    startTime: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    endTime: timestamp({ precision: 3, mode: 'string' }),
    betAmount: numeric({ precision: 65, scale: 30 }),
    winAmount: numeric({ precision: 65, scale: 30 }),
    xpEarned: integer().default(0).notNull(),
    metadata: jsonb(),
    gameId: text().notNull(),
    tournamentId: text(),
    active: boolean().default(false).notNull(),
    profileId: text().notNull(),
}, (table) => [
    index("session_game_idx").using("btree", table.gameId.asc().nullsLast().op("text_ops")),
    index("session_profile_idx").using("btree", table.profileId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.gameId],
        foreignColumns: [operatorgame.id],
        name: "GameSession_gameId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    foreignKey({
        columns: [table.tournamentId],
        foreignColumns: [tournament.id],
        name: "GameSession_tournamentId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    foreignKey({
        columns: [table.profileId],
        foreignColumns: [profile.id],
        name: "GameSession_profileId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const tournament = pgTable("tournament", {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    startTime: timestamp({ precision: 3, mode: 'string' }).notNull(),
    endTime: timestamp({ precision: 3, mode: 'string' }).notNull(),
    entryFee: numeric({ precision: 65, scale: 30 }),
    prizePool: numeric({ precision: 65, scale: 30 }).default('0').notNull(),
    isActive: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    operatorId: text().notNull(),
    leaderboard: jsonb(),
}, (table) => [
    index("tournament_operator_idx").using("btree", table.operatorId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.operatorId],
        foreignColumns: [operator.id],
        name: "Tournament_operatorId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const transaction = pgTable("transaction", {
    id: text().primaryKey().notNull(),
    type: transactionType().notNull(),
    amount: numeric({ precision: 65, scale: 30 }).notNull(),
    reference: text(),
    status: transactionStatus().default('PENDING').notNull(),
    metadata: jsonb(),
    isRealMoney: boolean().default(false).notNull(),
    paymentMethod: text(),
    paymentDetails: jsonb(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    processedAt: timestamp({ precision: 3, mode: 'string' }),
    gameSessionId: text(),
    profileId: text().notNull(),
}, (table) => [
    index("transaction_profile_idx").using("btree", table.profileId.asc().nullsLast().op("text_ops")),
    index("transaction_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
    foreignKey({
        columns: [table.gameSessionId],
        foreignColumns: [gamesession.id],
        name: "Transaction_gameSessionId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    foreignKey({
        columns: [table.profileId],
        foreignColumns: [profile.id],
        name: "Transaction_profileId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const achievement = pgTable("achievement", {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    description: text().notNull(),
    targetXp: integer().notNull(),
    reward: numeric({ precision: 65, scale: 30 }),
    isActive: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
});
export const user = pgTable("user", {
    id: text().primaryKey().notNull(),
    username: text().notNull(),
    email: text().notNull(),
    passwordHash: text().notNull(),
    avatar: text(),
    totalXp: integer().default(0).notNull(),
    balance: numeric({ precision: 65, scale: 30 }).default('0').notNull(),
    lastLogin: timestamp({ precision: 3, mode: 'string' }),
    isVerified: boolean().default(false).notNull(),
    verificationToken: text(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    active: boolean().default(false).notNull(),
    activeProfileId: text(),
    gender: gender(),
    status: userStatus(),
    cashtag: text(),
    phpId: integer(),
    accessToken: text(),
}, (table) => [
    uniqueIndex("User_activeProfileId_key").using("btree", table.activeProfileId.asc().nullsLast().op("text_ops")),
    uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
    uniqueIndex("User_username_key").using("btree", table.username.asc().nullsLast().op("text_ops")),
    index("user_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
    index("user_username_email_idx").using("btree", table.username.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.activeProfileId],
        foreignColumns: [profile.id],
        name: "User_activeProfileId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
export const profile = pgTable("profile", {
    id: text().primaryKey().notNull(),
    profileNumber: text().notNull(),
    balance: integer().default(0).notNull(),
    xpEarned: integer().default(0).notNull(),
    isActive: boolean().default(false).notNull(),
    lastPlayed: timestamp({ precision: 3, mode: 'string' }),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    phpId: integer(),
    userId: text().notNull(),
    bankId: text().notNull(),
    shopId: text().notNull(),
}, (table) => [
    uniqueIndex("Profile_phpId_key").using("btree", table.phpId.asc().nullsLast().op("int4_ops")),
    uniqueIndex("Profile_profileNumber_key").using("btree", table.profileNumber.asc().nullsLast().op("text_ops")),
    uniqueIndex("Profile_userId_shopId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.shopId.asc().nullsLast().op("text_ops")),
    index("operator_active_profile_idx").using("btree", table.shopId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("text_ops")),
    index("profile_number_idx").using("btree", table.profileNumber.asc().nullsLast().op("text_ops")),
    index("user_active_profile_idx").using("btree", table.userId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("bool_ops")),
    foreignKey({
        columns: [table.bankId],
        foreignColumns: [bank.id],
        name: "Profile_bankId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Profile_userId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
        columns: [table.shopId],
        foreignColumns: [operator.id],
        name: "Profile_shopId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
export const session = pgTable("session", {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    activeGameId: text(),
    ipAddress: text(),
    userAgent: text(),
    expiresAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    refreshToken: text().notNull(),
    active: boolean().default(false).notNull(),
}, (table) => [
    index("Session_refreshToken_idx").using("btree", table.refreshToken.asc().nullsLast().op("text_ops")),
    uniqueIndex("Session_refreshToken_key").using("btree", table.refreshToken.asc().nullsLast().op("text_ops")),
    index("Session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Session_userId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const tournamententry = pgTable("tournamententry", {
    id: text().primaryKey().notNull(),
    score: integer().default(0).notNull(),
    wagered: numeric({ precision: 65, scale: 30 }).default('0').notNull(),
    won: numeric({ precision: 65, scale: 30 }).default('0').notNull(),
    joinedAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    userId: text().notNull(),
    tournamentId: text().notNull(),
    profileId: text().notNull(),
}, (table) => [
    uniqueIndex("TournamentEntry_userId_tournamentId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.tournamentId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "TournamentEntry_userId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    foreignKey({
        columns: [table.tournamentId],
        foreignColumns: [tournament.id],
        name: "TournamentEntry_tournamentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    foreignKey({
        columns: [table.profileId],
        foreignColumns: [profile.id],
        name: "TournamentEntry_profileId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const friendship = pgTable("friendship", {
    id: text().primaryKey().notNull(),
    status: friendshipStatus().default('PENDING').notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    userId: text().notNull(),
    friendId: text().notNull(),
}, (table) => [
    uniqueIndex("Friendship_userId_friendId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.friendId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Friendship_userId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    foreignKey({
        columns: [table.friendId],
        foreignColumns: [user.id],
        name: "Friendship_friendId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const notification = pgTable("notification", {
    id: text().primaryKey().notNull(),
    type: notificationType().notNull(),
    title: text().notNull(),
    message: text().notNull(),
    isRead: boolean().default(false).notNull(),
    readAt: timestamp({ precision: 3, mode: 'string' }),
    metadata: jsonb(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    userId: text().notNull(),
}, (table) => [
    index("notification_user_status_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.isRead.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Notification_userId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const userachievement = pgTable("userachievement", {
    id: text().primaryKey().notNull(),
    progress: integer().default(0).notNull(),
    isUnlocked: boolean().default(false).notNull(),
    unlockedAt: timestamp({ precision: 3, mode: 'string' }),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    userId: text().notNull(),
    achievementId: text().notNull(),
}, (table) => [
    uniqueIndex("UserAchievement_userId_achievementId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.achievementId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "UserAchievement_userId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    foreignKey({
        columns: [table.achievementId],
        foreignColumns: [achievement.id],
        name: "UserAchievement_achievementId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const tournamentgame = pgTable("tournamentgame", {
    id: text().primaryKey().notNull(),
    multiplier: doublePrecision().default(1).notNull(),
    tournamentId: text().notNull(),
    gameId: text().notNull(),
}, (table) => [
    uniqueIndex("TournamentGame_tournamentId_gameId_key").using("btree", table.tournamentId.asc().nullsLast().op("text_ops"), table.gameId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.tournamentId],
        foreignColumns: [tournament.id],
        name: "TournamentGame_tournamentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    foreignKey({
        columns: [table.gameId],
        foreignColumns: [operatorgame.id],
        name: "TournamentGame_gameId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
export const chatroom = pgTable("chatroom", {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    isGameRoom: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql `CURRENT_TIMESTAMP`).notNull(),
    gameSessionId: text(),
}, (table) => [
    foreignKey({
        columns: [table.gameSessionId],
        foreignColumns: [gamesession.id],
        name: "ChatRoom_gameSessionId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
