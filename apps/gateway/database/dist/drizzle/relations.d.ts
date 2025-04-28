export declare const operatorRelations: import("drizzle-orm/relations").Relations<string, {
    user: import("drizzle-orm/relations").One<any, false>;
    banks: import("drizzle-orm/relations").Many<any>;
    operatorgames: import("drizzle-orm/relations").Many<"operatorgame">;
    tournaments: import("drizzle-orm/relations").Many<"tournament">;
    profiles: import("drizzle-orm/relations").Many<any>;
}>;
export declare const userRelations: import("drizzle-orm/relations").Relations<string, {
    operators: import("drizzle-orm/relations").Many<any>;
    chatmessages: import("drizzle-orm/relations").Many<"chatmessage">;
    profile: import("drizzle-orm/relations").One<any, false>;
    profiles: import("drizzle-orm/relations").Many<any>;
    sessions: import("drizzle-orm/relations").Many<"session">;
    tournamententries: import("drizzle-orm/relations").Many<"tournamententry">;
    friendships_userId: import("drizzle-orm/relations").Many<"friendship">;
    friendships_friendId: import("drizzle-orm/relations").Many<"friendship">;
    notifications: import("drizzle-orm/relations").Many<"notification">;
    userachievements: import("drizzle-orm/relations").Many<"userachievement">;
}>;
export declare const bankRelations: import("drizzle-orm/relations").Relations<string, {
    operator: import("drizzle-orm/relations").One<any, false>;
    profiles: import("drizzle-orm/relations").Many<any>;
}>;
export declare const chatmessageRelations: import("drizzle-orm/relations").Relations<"chatmessage", {
    user: import("drizzle-orm/relations").One<any, true>;
    chatroom: import("drizzle-orm/relations").One<"chatroom", false>;
}>;
export declare const chatroomRelations: import("drizzle-orm/relations").Relations<"chatroom", {
    chatmessages: import("drizzle-orm/relations").Many<"chatmessage">;
    gamesession: import("drizzle-orm/relations").One<"gamesession", false>;
}>;
export declare const operatorgameRelations: import("drizzle-orm/relations").Relations<"operatorgame", {
    operator: import("drizzle-orm/relations").One<any, true>;
    gamesessions: import("drizzle-orm/relations").Many<"gamesession">;
    tournamentgames: import("drizzle-orm/relations").Many<"tournamentgame">;
}>;
export declare const gamesessionRelations: import("drizzle-orm/relations").Relations<"gamesession", {
    operatorgame: import("drizzle-orm/relations").One<"operatorgame", true>;
    tournament: import("drizzle-orm/relations").One<"tournament", false>;
    profile: import("drizzle-orm/relations").One<any, true>;
    transactions: import("drizzle-orm/relations").Many<"transaction">;
    chatrooms: import("drizzle-orm/relations").Many<"chatroom">;
}>;
export declare const tournamentRelations: import("drizzle-orm/relations").Relations<"tournament", {
    gamesessions: import("drizzle-orm/relations").Many<"gamesession">;
    operator: import("drizzle-orm/relations").One<any, true>;
    tournamententries: import("drizzle-orm/relations").Many<"tournamententry">;
    tournamentgames: import("drizzle-orm/relations").Many<"tournamentgame">;
}>;
export declare const profileRelations: import("drizzle-orm/relations").Relations<string, {
    gamesessions: import("drizzle-orm/relations").Many<"gamesession">;
    transactions: import("drizzle-orm/relations").Many<"transaction">;
    users: import("drizzle-orm/relations").Many<any>;
    bank: import("drizzle-orm/relations").One<any, false>;
    user: import("drizzle-orm/relations").One<any, false>;
    operator: import("drizzle-orm/relations").One<any, false>;
    tournamententries: import("drizzle-orm/relations").Many<"tournamententry">;
}>;
export declare const transactionRelations: import("drizzle-orm/relations").Relations<"transaction", {
    gamesession: import("drizzle-orm/relations").One<"gamesession", false>;
    profile: import("drizzle-orm/relations").One<any, true>;
}>;
export declare const sessionRelations: import("drizzle-orm/relations").Relations<"session", {
    user: import("drizzle-orm/relations").One<any, true>;
}>;
export declare const tournamententryRelations: import("drizzle-orm/relations").Relations<"tournamententry", {
    user: import("drizzle-orm/relations").One<any, true>;
    tournament: import("drizzle-orm/relations").One<"tournament", true>;
    profile: import("drizzle-orm/relations").One<any, true>;
}>;
export declare const friendshipRelations: import("drizzle-orm/relations").Relations<"friendship", {
    user_userId: import("drizzle-orm/relations").One<any, true>;
    user_friendId: import("drizzle-orm/relations").One<any, true>;
}>;
export declare const notificationRelations: import("drizzle-orm/relations").Relations<"notification", {
    user: import("drizzle-orm/relations").One<any, true>;
}>;
export declare const userachievementRelations: import("drizzle-orm/relations").Relations<"userachievement", {
    user: import("drizzle-orm/relations").One<any, true>;
    achievement: import("drizzle-orm/relations").One<"achievement", true>;
}>;
export declare const achievementRelations: import("drizzle-orm/relations").Relations<"achievement", {
    userachievements: import("drizzle-orm/relations").Many<"userachievement">;
}>;
export declare const tournamentgameRelations: import("drizzle-orm/relations").Relations<"tournamentgame", {
    tournament: import("drizzle-orm/relations").One<"tournament", true>;
    operatorgame: import("drizzle-orm/relations").One<"operatorgame", true>;
}>;
