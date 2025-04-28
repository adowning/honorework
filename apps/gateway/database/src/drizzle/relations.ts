import { relations } from "drizzle-orm/relations";
import { user, operator, bank, chatmessage, chatroom, operatorgame, gamesession, tournament, profile, transaction, session, tournamententry, friendship, notification, userachievement, achievement, tournamentgame } from "./schema";

export const operatorRelations = relations(operator, ({one, many}) => ({
	user: one(user, {
		fields: [operator.ownerId],
		references: [user.id]
	}),
	banks: many(bank),
	operatorgames: many(operatorgame),
	tournaments: many(tournament),
	profiles: many(profile),
}));

export const userRelations = relations(user, ({one, many}) => ({
	operators: many(operator),
	chatmessages: many(chatmessage),
	profile: one(profile, {
		fields: [user.activeProfileId],
		references: [profile.id],
		relationName: "user_activeProfileId_profile_id"
	}),
	profiles: many(profile, {
		relationName: "profile_userId_user_id"
	}),
	sessions: many(session),
	tournamententries: many(tournamententry),
	friendships_userId: many(friendship, {
		relationName: "friendship_userId_user_id"
	}),
	friendships_friendId: many(friendship, {
		relationName: "friendship_friendId_user_id"
	}),
	notifications: many(notification),
	userachievements: many(userachievement),
}));

export const bankRelations = relations(bank, ({one, many}) => ({
	operator: one(operator, {
		fields: [bank.operatorId],
		references: [operator.id]
	}),
	profiles: many(profile),
}));

export const chatmessageRelations = relations(chatmessage, ({one}) => ({
	user: one(user, {
		fields: [chatmessage.userId],
		references: [user.id]
	}),
	chatroom: one(chatroom, {
		fields: [chatmessage.roomId],
		references: [chatroom.id]
	}),
}));

export const chatroomRelations = relations(chatroom, ({one, many}) => ({
	chatmessages: many(chatmessage),
	gamesession: one(gamesession, {
		fields: [chatroom.gameSessionId],
		references: [gamesession.id]
	}),
}));

export const operatorgameRelations = relations(operatorgame, ({one, many}) => ({
	operator: one(operator, {
		fields: [operatorgame.operatorId],
		references: [operator.id]
	}),
	gamesessions: many(gamesession),
	tournamentgames: many(tournamentgame),
}));

export const gamesessionRelations = relations(gamesession, ({one, many}) => ({
	operatorgame: one(operatorgame, {
		fields: [gamesession.gameId],
		references: [operatorgame.id]
	}),
	tournament: one(tournament, {
		fields: [gamesession.tournamentId],
		references: [tournament.id]
	}),
	profile: one(profile, {
		fields: [gamesession.profileId],
		references: [profile.id]
	}),
	transactions: many(transaction),
	chatrooms: many(chatroom),
}));

export const tournamentRelations = relations(tournament, ({one, many}) => ({
	gamesessions: many(gamesession),
	operator: one(operator, {
		fields: [tournament.operatorId],
		references: [operator.id]
	}),
	tournamententries: many(tournamententry),
	tournamentgames: many(tournamentgame),
}));

export const profileRelations = relations(profile, ({one, many}) => ({
	gamesessions: many(gamesession),
	transactions: many(transaction),
	users: many(user, {
		relationName: "user_activeProfileId_profile_id"
	}),
	bank: one(bank, {
		fields: [profile.bankId],
		references: [bank.id]
	}),
	user: one(user, {
		fields: [profile.userId],
		references: [user.id],
		relationName: "profile_userId_user_id"
	}),
	operator: one(operator, {
		fields: [profile.shopId],
		references: [operator.id]
	}),
	tournamententries: many(tournamententry),
}));

export const transactionRelations = relations(transaction, ({one}) => ({
	gamesession: one(gamesession, {
		fields: [transaction.gameSessionId],
		references: [gamesession.id]
	}),
	profile: one(profile, {
		fields: [transaction.profileId],
		references: [profile.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const tournamententryRelations = relations(tournamententry, ({one}) => ({
	user: one(user, {
		fields: [tournamententry.userId],
		references: [user.id]
	}),
	tournament: one(tournament, {
		fields: [tournamententry.tournamentId],
		references: [tournament.id]
	}),
	profile: one(profile, {
		fields: [tournamententry.profileId],
		references: [profile.id]
	}),
}));

export const friendshipRelations = relations(friendship, ({one}) => ({
	user_userId: one(user, {
		fields: [friendship.userId],
		references: [user.id],
		relationName: "friendship_userId_user_id"
	}),
	user_friendId: one(user, {
		fields: [friendship.friendId],
		references: [user.id],
		relationName: "friendship_friendId_user_id"
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
}));

export const userachievementRelations = relations(userachievement, ({one}) => ({
	user: one(user, {
		fields: [userachievement.userId],
		references: [user.id]
	}),
	achievement: one(achievement, {
		fields: [userachievement.achievementId],
		references: [achievement.id]
	}),
}));

export const achievementRelations = relations(achievement, ({many}) => ({
	userachievements: many(userachievement),
}));

export const tournamentgameRelations = relations(tournamentgame, ({one}) => ({
	tournament: one(tournament, {
		fields: [tournamentgame.tournamentId],
		references: [tournament.id]
	}),
	operatorgame: one(operatorgame, {
		fields: [tournamentgame.gameId],
		references: [operatorgame.id]
	}),
}));