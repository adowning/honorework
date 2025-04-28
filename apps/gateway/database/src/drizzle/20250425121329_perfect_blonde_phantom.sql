-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."ChatChannel" AS ENUM('LOBBY', 'GAME', 'TOURNAMENT', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."FriendshipStatus" AS ENUM('PENDING', 'ACCEPTED', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."Gender" AS ENUM('BOY', 'GIRL', 'ALIEN', 'UNSURE', 'ROBOT', 'COMPLICATED');--> statement-breakpoint
CREATE TYPE "public"."NotificationType" AS ENUM('SYSTEM', 'FRIEND_REQUEST', 'ACHIEVEMENT', 'BALANCE_UPDATE', 'PROMOTIONAL', 'TOURNAMENT');--> statement-breakpoint
CREATE TYPE "public"."TransactionStatus" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."TransactionType" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS', 'DONATION', 'ADJUSTMENT', 'TOURNAMENT_BUYIN', 'TOURNAMENT_PRIZE');--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'INACTIVE', 'ONLINE', 'OFFLINE');--> statement-breakpoint
CREATE TABLE "TournamentEntry" (
	"id" text PRIMARY KEY NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"wagered" numeric(65, 30) DEFAULT '0' NOT NULL,
	"won" numeric(65, 30) DEFAULT '0' NOT NULL,
	"joinedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"userId" text NOT NULL,
	"tournamentId" text NOT NULL,
	"profileId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"activeGameId" text,
	"ipAddress" text,
	"userAgent" text,
	"expiresAt" timestamp(3) NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"refreshToken" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OperatorGame" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"minBet" numeric(65, 30),
	"maxBet" numeric(65, 30),
	"xpMultiplier" double precision DEFAULT 1 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isPromoted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"operatorId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Bank" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"operatorId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tournament" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"startTime" timestamp(3) NOT NULL,
	"endTime" timestamp(3) NOT NULL,
	"entryFee" numeric(65, 30),
	"prizePool" numeric(65, 30) DEFAULT '0' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"operatorId" text NOT NULL,
	"leaderboard" jsonb
);
--> statement-breakpoint
CREATE TABLE "TournamentGame" (
	"id" text PRIMARY KEY NOT NULL,
	"multiplier" double precision DEFAULT 1 NOT NULL,
	"tournamentId" text NOT NULL,
	"gameId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Operator" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"description" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"ownerId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "GameSession" (
	"id" text PRIMARY KEY NOT NULL,
	"startTime" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"endTime" timestamp(3),
	"betAmount" numeric(65, 30),
	"winAmount" numeric(65, 30),
	"xpEarned" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"gameId" text NOT NULL,
	"tournamentId" text,
	"active" boolean DEFAULT false NOT NULL,
	"profileId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Friendship" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "FriendshipStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"userId" text NOT NULL,
	"friendId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "NotificationType" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp(3),
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ChatMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"channel" "ChatChannel" NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"userId" text NOT NULL,
	"roomId" text
);
--> statement-breakpoint
CREATE TABLE "Achievement" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"targetXp" integer NOT NULL,
	"reward" numeric(65, 30),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserAchievement" (
	"id" text PRIMARY KEY NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"isUnlocked" boolean DEFAULT false NOT NULL,
	"unlockedAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"userId" text NOT NULL,
	"achievementId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ChatRoom" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"isGameRoom" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"gameSessionId" text
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"avatar" text,
	"totalXp" integer DEFAULT 0 NOT NULL,
	"balance" numeric(65, 30) DEFAULT '0' NOT NULL,
	"lastLogin" timestamp(3),
	"isVerified" boolean DEFAULT false NOT NULL,
	"verificationToken" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"activeProfileId" text,
	"gender" "Gender",
	"status" "UserStatus",
	"cashtag" text,
	"phpId" integer,
	"accessToken" text
);
--> statement-breakpoint
CREATE TABLE "Transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "TransactionType" NOT NULL,
	"amount" numeric(65, 30) NOT NULL,
	"reference" text,
	"status" "TransactionStatus" DEFAULT 'PENDING' NOT NULL,
	"metadata" jsonb,
	"isRealMoney" boolean DEFAULT false NOT NULL,
	"paymentMethod" text,
	"paymentDetails" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"processedAt" timestamp(3),
	"gameSessionId" text,
	"profileId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Profile" (
	"id" text PRIMARY KEY NOT NULL,
	"profileNumber" text NOT NULL,
	"balance" numeric(65, 30) DEFAULT '0' NOT NULL,
	"xpEarned" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"lastPlayed" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"phpId" integer,
	"userId" text NOT NULL,
	"bankId" text NOT NULL,
	"shopId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "public"."Tournament"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "OperatorGame" ADD CONSTRAINT "OperatorGame_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."Operator"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."Operator"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."Operator"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TournamentGame" ADD CONSTRAINT "TournamentGame_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "public"."Tournament"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TournamentGame" ADD CONSTRAINT "TournamentGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."OperatorGame"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."OperatorGame"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "public"."Tournament"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."ChatRoom"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "public"."GameSession"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_activeProfileId_fkey" FOREIGN KEY ("activeProfileId") REFERENCES "public"."Profile"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "public"."GameSession"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "public"."Bank"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Operator"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "TournamentEntry_userId_tournamentId_key" ON "TournamentEntry" USING btree ("userId" text_ops,"tournamentId" text_ops);--> statement-breakpoint
CREATE INDEX "Session_refreshToken_idx" ON "Session" USING btree ("refreshToken" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session" USING btree ("refreshToken" text_ops);--> statement-breakpoint
CREATE INDEX "Session_userId_idx" ON "Session" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "OperatorGame_slug_key" ON "OperatorGame" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "game_slug_idx" ON "OperatorGame" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Bank_operatorId_name_key" ON "Bank" USING btree ("operatorId" text_ops,"name" text_ops);--> statement-breakpoint
CREATE INDEX "tournament_operator_idx" ON "Tournament" USING btree ("operatorId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "TournamentGame_tournamentId_gameId_key" ON "TournamentGame" USING btree ("tournamentId" text_ops,"gameId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Operator_slug_key" ON "Operator" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "operator_slug_idx" ON "Operator" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "session_game_idx" ON "GameSession" USING btree ("gameId" text_ops);--> statement-breakpoint
CREATE INDEX "session_profile_idx" ON "GameSession" USING btree ("profileId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship" USING btree ("userId" text_ops,"friendId" text_ops);--> statement-breakpoint
CREATE INDEX "notification_user_status_idx" ON "Notification" USING btree ("userId" text_ops,"isRead" text_ops);--> statement-breakpoint
CREATE INDEX "chat_channel_idx" ON "ChatMessage" USING btree ("channel" enum_ops);--> statement-breakpoint
CREATE INDEX "chat_room_idx" ON "ChatMessage" USING btree ("roomId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement" USING btree ("userId" text_ops,"achievementId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_activeProfileId_key" ON "User" USING btree ("activeProfileId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_username_key" ON "User" USING btree ("username" text_ops);--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "User" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "user_username_email_idx" ON "User" USING btree ("username" text_ops,"email" text_ops);--> statement-breakpoint
CREATE INDEX "transaction_profile_idx" ON "Transaction" USING btree ("profileId" text_ops);--> statement-breakpoint
CREATE INDEX "transaction_type_idx" ON "Transaction" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Profile_phpId_key" ON "Profile" USING btree ("phpId" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Profile_profileNumber_key" ON "Profile" USING btree ("profileNumber" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Profile_userId_shopId_key" ON "Profile" USING btree ("userId" text_ops,"shopId" text_ops);--> statement-breakpoint
CREATE INDEX "operator_active_profile_idx" ON "Profile" USING btree ("shopId" bool_ops,"isActive" text_ops);--> statement-breakpoint
CREATE INDEX "profile_number_idx" ON "Profile" USING btree ("profileNumber" text_ops);--> statement-breakpoint
CREATE INDEX "user_active_profile_idx" ON "Profile" USING btree ("userId" bool_ops,"isActive" bool_ops);
*/