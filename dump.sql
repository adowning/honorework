--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: ChatChannel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ChatChannel" AS ENUM (
    'LOBBY',
    'GAME',
    'TOURNAMENT',
    'PRIVATE'
);


ALTER TYPE public."ChatChannel" OWNER TO postgres;

--
-- Name: FriendshipStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FriendshipStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'BLOCKED'
);


ALTER TYPE public."FriendshipStatus" OWNER TO postgres;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'BOY',
    'GIRL',
    'ALIEN',
    'UNSURE',
    'ROBOT',
    'COMPLICATED'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'SYSTEM',
    'FRIEND_REQUEST',
    'ACHIEVEMENT',
    'BALANCE_UPDATE',
    'PROMOTIONAL',
    'TOURNAMENT'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."TransactionStatus" OWNER TO postgres;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransactionType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'BET',
    'WIN',
    'BONUS',
    'DONATION',
    'ADJUSTMENT',
    'TOURNAMENT_BUYIN',
    'TOURNAMENT_PRIZE'
);


ALTER TYPE public."TransactionType" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ONLINE',
    'OFFLINE'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: notify_profile_balance_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_profile_balance_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  notification_payload JSON;
BEGIN
  IF TG_OP = 'INSERT' THEN
    notification_payload := json_build_object(
      'operation', TG_OP,
      'profile_id', NEW.id, -- Assuming 'id' is the primary key for profile
      'balance', NEW.balance,
      'change_type', 'initial_balance' -- Or some other relevant description
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.balance IS DISTINCT FROM NEW.balance THEN
      notification_payload := json_build_object(
        'operation', TG_OP,
        'profile_id', NEW.id,
		'userId', NEW."userId",
		'old_balance', OLD.balance,
        'new_balance', NEW.balance,
        'change_type', 'balance_update'
        -- You could add more details about the update if needed
      );
    ELSE
      -- No balance change, don't send a notification for this specific field
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    notification_payload := json_build_object(
      'operation', TG_OP,
      'profile_id', OLD.id,
      'deleted_balance', OLD.balance,
      'change_type', 'profile_deletion'
    );
  ELSE
    RAISE NOTICE 'Unsupported trigger operation: %', TG_OP;
    RETURN NULL;
  END IF;

  PERFORM pg_notify(
    'profile_balance_channel',
    json_build_object(
      'table', TG_TABLE_NAME,
      'event_data', notification_payload
    )::text
  );

  RETURN NEW; -- For INSERT and UPDATE
  RETURN OLD; -- For DELETE
END;
$$;


ALTER FUNCTION public.notify_profile_balance_change() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievement (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "targetXp" integer NOT NULL,
    reward numeric(65,30),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.achievement OWNER TO postgres;

--
-- Name: bank; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank (
    id text NOT NULL,
    name text NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "operatorId" text NOT NULL
);


ALTER TABLE public.bank OWNER TO postgres;

--
-- Name: chatmessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chatmessage (
    id text NOT NULL,
    content text NOT NULL,
    channel public."ChatChannel" NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "roomId" text
);


ALTER TABLE public.chatmessage OWNER TO postgres;

--
-- Name: chatroom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chatroom (
    id text NOT NULL,
    name text NOT NULL,
    "isGameRoom" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gameSessionId" text
);


ALTER TABLE public.chatroom OWNER TO postgres;

--
-- Name: friendship; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friendship (
    id text NOT NULL,
    status public."FriendshipStatus" DEFAULT 'PENDING'::public."FriendshipStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "friendId" text NOT NULL
);


ALTER TABLE public.friendship OWNER TO postgres;

--
-- Name: gamesession; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamesession (
    id text NOT NULL,
    "startTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endTime" timestamp(3) without time zone,
    "betAmount" numeric(65,30),
    "winAmount" numeric(65,30),
    "xpEarned" integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    "gameId" text NOT NULL,
    "tournamentId" text,
    active boolean DEFAULT false NOT NULL,
    "profileId" text NOT NULL
);


ALTER TABLE public.gamesession OWNER TO postgres;

--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: operator; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operator (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ownerId" text NOT NULL
);


ALTER TABLE public.operator OWNER TO postgres;

--
-- Name: operatorgame; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operatorgame (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    thumbnail text,
    "minBet" numeric(65,30),
    "maxBet" numeric(65,30),
    "xpMultiplier" double precision DEFAULT 1.0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isPromoted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "operatorId" text NOT NULL
);


ALTER TABLE public.operatorgame OWNER TO postgres;

--
-- Name: profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile (
    id text NOT NULL,
    "profileNumber" text NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "lastPlayed" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "phpId" integer,
    "userId" text NOT NULL,
    "bankId" text NOT NULL,
    "shopId" text NOT NULL
);


ALTER TABLE public.profile OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    id text NOT NULL,
    "userId" text NOT NULL,
    "activeGameId" text,
    "ipAddress" text,
    "userAgent" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "refreshToken" text NOT NULL,
    active boolean DEFAULT false NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: tournament; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tournament (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "entryFee" numeric(65,30),
    "prizePool" numeric(65,30) DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "operatorId" text NOT NULL,
    leaderboard jsonb
);


ALTER TABLE public.tournament OWNER TO postgres;

--
-- Name: tournamententry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tournamententry (
    id text NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    wagered numeric(65,30) DEFAULT 0 NOT NULL,
    won numeric(65,30) DEFAULT 0 NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "tournamentId" text NOT NULL,
    "profileId" text NOT NULL
);


ALTER TABLE public.tournamententry OWNER TO postgres;

--
-- Name: tournamentgame; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tournamentgame (
    id text NOT NULL,
    multiplier double precision DEFAULT 1.0 NOT NULL,
    "tournamentId" text NOT NULL,
    "gameId" text NOT NULL
);


ALTER TABLE public.tournamentgame OWNER TO postgres;

--
-- Name: transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction (
    id text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount numeric(65,30) NOT NULL,
    reference text,
    status public."TransactionStatus" DEFAULT 'PENDING'::public."TransactionStatus" NOT NULL,
    metadata jsonb,
    "isRealMoney" boolean DEFAULT false NOT NULL,
    "paymentMethod" text,
    "paymentDetails" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "gameSessionId" text,
    "profileId" text NOT NULL
);


ALTER TABLE public.transaction OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    avatar text,
    "totalXp" integer DEFAULT 0 NOT NULL,
    balance numeric(65,30) DEFAULT 0 NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verificationToken" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT false NOT NULL,
    "activeProfileId" text,
    gender public."Gender",
    status public."UserStatus",
    cashtag text,
    "phpId" integer,
    "accessToken" text
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: userachievement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.userachievement (
    id text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "isUnlocked" boolean DEFAULT false NOT NULL,
    "unlockedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "achievementId" text NOT NULL
);


ALTER TABLE public.userachievement OWNER TO postgres;

--
-- Data for Name: achievement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievement (id, name, description, "targetXp", reward, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bank; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank (id, name, currency, "isActive", "createdAt", "operatorId") FROM stdin;
bank_1	Prime Casino Bank	USD	t	2025-04-25 13:37:59.972	operator_1
\.


--
-- Data for Name: chatmessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chatmessage (id, content, channel, metadata, "createdAt", "userId", "roomId") FROM stdin;
\.


--
-- Data for Name: chatroom; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chatroom (id, name, "isGameRoom", "createdAt", "gameSessionId") FROM stdin;
\.


--
-- Data for Name: friendship; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friendship (id, status, "createdAt", "updatedAt", "userId", "friendId") FROM stdin;
\.


--
-- Data for Name: gamesession; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamesession (id, "startTime", "endTime", "betAmount", "winAmount", "xpEarned", metadata, "gameId", "tournamentId", active, "profileId") FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, type, title, message, "isRead", "readAt", metadata, "createdAt", "userId") FROM stdin;
\.


--
-- Data for Name: operator; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operator (id, name, slug, logo, description, "isActive", "createdAt", "updatedAt", "ownerId") FROM stdin;
operator_1	Prime Casino Operator	prime-casino	\N	\N	t	2025-04-25 13:37:59.968	2025-04-25 13:37:59.964	user_owner
\.


--
-- Data for Name: operatorgame; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operatorgame (id, name, slug, description, thumbnail, "minBet", "maxBet", "xpMultiplier", "isActive", "isPromoted", "createdAt", "updatedAt", "operatorId") FROM stdin;
\.


--
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile (id, "profileNumber", balance, "xpEarned", "isActive", "lastPlayed", "createdAt", "updatedAt", "phpId", "userId", "bankId", "shopId") FROM stdin;
account_2	2	0	0	t	\N	2025-04-25 13:38:00.004	2025-04-25 13:38:00.003	2	user_2	bank_1	operator_1
account_3	3	0	0	t	\N	2025-04-25 13:38:00.012	2025-04-25 13:38:00.01	3	user_3	bank_1	operator_1
account_4	4	0	0	t	\N	2025-04-25 13:38:00.022	2025-04-25 13:38:00.021	4	user_4	bank_1	operator_1
account_5	5	0	0	t	\N	2025-04-25 13:38:00.032	2025-04-25 13:38:00.031	5	user_5	bank_1	operator_1
account_6	6	0	0	t	\N	2025-04-25 13:38:00.044	2025-04-25 13:38:00.042	6	user_6	bank_1	operator_1
account_7	7	0	0	t	\N	2025-04-25 13:38:00.056	2025-04-25 13:38:00.054	7	user_7	bank_1	operator_1
account_8	8	0	0	t	\N	2025-04-25 13:38:00.062	2025-04-25 13:38:00.061	8	user_8	bank_1	operator_1
account_9	9	0	0	t	\N	2025-04-25 13:38:00.071	2025-04-25 13:38:00.07	9	user_9	bank_1	operator_1
account_10	10	0	0	t	\N	2025-04-25 13:38:00.077	2025-04-25 13:38:00.075	10	user_10	bank_1	operator_1
account_1	1	221	0	t	\N	2025-04-25 13:37:59.978	2025-04-25 13:37:59.976	1	user_1	bank_1	operator_1
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (id, "userId", "activeGameId", "ipAddress", "userAgent", "expiresAt", "createdAt", "refreshToken", active) FROM stdin;
\.


--
-- Data for Name: tournament; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tournament (id, name, description, "startTime", "endTime", "entryFee", "prizePool", "isActive", "createdAt", "updatedAt", "operatorId", leaderboard) FROM stdin;
\.


--
-- Data for Name: tournamententry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tournamententry (id, score, wagered, won, "joinedAt", "userId", "tournamentId", "profileId") FROM stdin;
\.


--
-- Data for Name: tournamentgame; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tournamentgame (id, multiplier, "tournamentId", "gameId") FROM stdin;
\.


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction (id, type, amount, reference, status, metadata, "isRealMoney", "paymentMethod", "paymentDetails", "createdAt", "processedAt", "gameSessionId", "profileId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, username, email, "passwordHash", avatar, "totalXp", balance, "lastLogin", "isVerified", "verificationToken", "createdAt", "updatedAt", active, "activeProfileId", gender, status, cashtag, "phpId", "accessToken") FROM stdin;
user_owner	platform_owner	owner@operator.com	$argon2id$v=19$m=65536,t=2,p=1$XP4LhGiJ6Jkqqt01BM4vzT2zfbqP4KxkGpbJb5I99xc$ncLmvWRhxyjr4NbvH1mW9M8rxE0kB99Jd+MO8GJ6S3g	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:37:59.964	2025-04-25 13:37:59.96	f	\N	\N	\N	\N	\N	\N
user_1	player_1	player_1@gaming.com	$argon2id$v=19$m=4,t=3,p=1$bi5e89KQTk62xByzg0trH6EIkGMyYoiqOMoW8qX1KVE$72lWa5hu+MDj6l0LRNZatQcS6GY3Mj3sSavW6qnQdh0	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:37:59.976	2025-04-25 13:37:59.975	f	account_1	\N	\N	\N	\N	\N
user_2	player_2	player_2@gaming.com	$argon2id$v=19$m=4,t=3,p=1$u2JPrAy3EpMi+7oce1sE7/Uc1lP7Bzxnb+fNMgDsw8w$V3R71zx+ZP5tLTpta8JWeqSv0kapEZ1vg/McNCoFXYI	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.003	2025-04-25 13:38:00.001	f	account_2	\N	\N	\N	\N	\N
user_3	player_3	player_3@gaming.com	$argon2id$v=19$m=4,t=3,p=1$vubfFq9U9/HEdYh8tA70F1v24HZiHzefu5SvA8JEsmA$CwShawIBVGGBrevjc1+28v5oZm+UJb9fo7EWh8hU9Ys	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.011	2025-04-25 13:38:00.009	f	account_3	\N	\N	\N	\N	\N
user_4	player_4	player_4@gaming.com	$argon2id$v=19$m=4,t=3,p=1$mPps02sO/rvCGCVAQxFmAB8DnzJNdqQFdVs3vpvw2vw$8MqPedycTtYxDV4AItGAOmUkF06Tt8i3/bpzntGm5gA	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.021	2025-04-25 13:38:00.019	f	account_4	\N	\N	\N	\N	\N
user_5	player_5	player_5@gaming.com	$argon2id$v=19$m=4,t=3,p=1$Wosu+gNf7foZAGFYRPWDyH4ei8AAFWn2F/2KFqqQ6iY$+XB2ugw5iPFYwbhVRrpQEMqkGQOuaHX2dPH4/ewXwA4	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.031	2025-04-25 13:38:00.029	f	account_5	\N	\N	\N	\N	\N
user_6	player_6	player_6@gaming.com	$argon2id$v=19$m=4,t=3,p=1$EvmPggHbidQTGBzMHPZx0K6MdKYY5LeZBzd+ZYDbJ1g$uu9hI92t5psre5xMgGBw2lSiOZHr6dURDjv27FT/+I8	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.042	2025-04-25 13:38:00.04	f	account_6	\N	\N	\N	\N	\N
user_7	player_7	player_7@gaming.com	$argon2id$v=19$m=4,t=3,p=1$8GvzhYyaEBqS13GopOk2OKzG8Xt7m3+N+WmV6EoRyw4$6tnQ0nwldUQn4uVR3dxwspLQZynOybyxK4kQa0+RemA	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.054	2025-04-25 13:38:00.053	f	account_7	\N	\N	\N	\N	\N
user_8	player_8	player_8@gaming.com	$argon2id$v=19$m=4,t=3,p=1$VTyBWIL84hU3sue6wAylZwAM8p8kNaPua6xH9ncXA4w$e5Z3yU5PHge1nDMCzlpfqzjd3bY1ff1sX7y22+YdyRk	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.061	2025-04-25 13:38:00.059	f	account_8	\N	\N	\N	\N	\N
user_9	player_9	player_9@gaming.com	$argon2id$v=19$m=4,t=3,p=1$uo5/4d0HOoSFAnb86b+XN6yqRxtCFCULyi8DV/OY/G8$zIoUD+FNbxNUlV5OlzJrVbJX4dTT9icDRmYeM0kcew4	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.07	2025-04-25 13:38:00.069	f	account_9	\N	\N	\N	\N	\N
user_10	player_10	player_10@gaming.com	$argon2id$v=19$m=4,t=3,p=1$FtUXUkH5o36J4GuWfpShk7ZFa1BWCKLNLAaX21iqvGk$7mfeWe3A4cCmV6MMxsWrEZJuxtd+Rfz2jMw/h9NLVjA	\N	0	0.000000000000000000000000000000	\N	f	\N	2025-04-25 13:38:00.076	2025-04-25 13:38:00.074	f	account_10	\N	\N	\N	\N	\N
\.


--
-- Data for Name: userachievement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.userachievement (id, progress, "isUnlocked", "unlockedAt", "createdAt", "updatedAt", "userId", "achievementId") FROM stdin;
\.


--
-- Name: achievement Achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY (id);


--
-- Name: bank Bank_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank
    ADD CONSTRAINT "Bank_pkey" PRIMARY KEY (id);


--
-- Name: chatmessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatmessage
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: chatroom ChatRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatroom
    ADD CONSTRAINT "ChatRoom_pkey" PRIMARY KEY (id);


--
-- Name: friendship Friendship_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendship
    ADD CONSTRAINT "Friendship_pkey" PRIMARY KEY (id);


--
-- Name: gamesession GameSession_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamesession
    ADD CONSTRAINT "GameSession_pkey" PRIMARY KEY (id);


--
-- Name: notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: operatorgame OperatorGame_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operatorgame
    ADD CONSTRAINT "OperatorGame_pkey" PRIMARY KEY (id);


--
-- Name: operator Operator_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operator
    ADD CONSTRAINT "Operator_pkey" PRIMARY KEY (id);


--
-- Name: profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: tournamententry TournamentEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournamententry
    ADD CONSTRAINT "TournamentEntry_pkey" PRIMARY KEY (id);


--
-- Name: tournamentgame TournamentGame_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournamentgame
    ADD CONSTRAINT "TournamentGame_pkey" PRIMARY KEY (id);


--
-- Name: tournament Tournament_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournament
    ADD CONSTRAINT "Tournament_pkey" PRIMARY KEY (id);


--
-- Name: transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: userachievement UserAchievement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userachievement
    ADD CONSTRAINT "UserAchievement_pkey" PRIMARY KEY (id);


--
-- Name: user User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Bank_operatorId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Bank_operatorId_name_key" ON public.bank USING btree ("operatorId", name);


--
-- Name: Friendship_userId_friendId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON public.friendship USING btree ("userId", "friendId");


--
-- Name: OperatorGame_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OperatorGame_slug_key" ON public.operatorgame USING btree (slug);


--
-- Name: Operator_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Operator_slug_key" ON public.operator USING btree (slug);


--
-- Name: Profile_phpId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Profile_phpId_key" ON public.profile USING btree ("phpId");


--
-- Name: Profile_profileNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Profile_profileNumber_key" ON public.profile USING btree ("profileNumber");


--
-- Name: Profile_userId_shopId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Profile_userId_shopId_key" ON public.profile USING btree ("userId", "shopId");


--
-- Name: Session_refreshToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_refreshToken_idx" ON public.session USING btree ("refreshToken");


--
-- Name: Session_refreshToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_refreshToken_key" ON public.session USING btree ("refreshToken");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public.session USING btree ("userId");


--
-- Name: TournamentEntry_userId_tournamentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TournamentEntry_userId_tournamentId_key" ON public.tournamententry USING btree ("userId", "tournamentId");


--
-- Name: TournamentGame_tournamentId_gameId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TournamentGame_tournamentId_gameId_key" ON public.tournamentgame USING btree ("tournamentId", "gameId");


--
-- Name: UserAchievement_userId_achievementId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON public.userachievement USING btree ("userId", "achievementId");


--
-- Name: User_activeProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_activeProfileId_key" ON public."user" USING btree ("activeProfileId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."user" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."user" USING btree (username);


--
-- Name: chat_channel_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX chat_channel_idx ON public.chatmessage USING btree (channel);


--
-- Name: chat_room_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX chat_room_idx ON public.chatmessage USING btree ("roomId");


--
-- Name: game_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_slug_idx ON public.operatorgame USING btree (slug);


--
-- Name: notification_user_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notification_user_status_idx ON public.notification USING btree ("userId", "isRead");


--
-- Name: operator_active_profile_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operator_active_profile_idx ON public.profile USING btree ("shopId", "isActive");


--
-- Name: operator_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operator_slug_idx ON public.operator USING btree (slug);


--
-- Name: profile_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX profile_number_idx ON public.profile USING btree ("profileNumber");


--
-- Name: session_game_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX session_game_idx ON public.gamesession USING btree ("gameId");


--
-- Name: session_profile_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX session_profile_idx ON public.gamesession USING btree ("profileId");


--
-- Name: tournament_operator_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tournament_operator_idx ON public.tournament USING btree ("operatorId");


--
-- Name: transaction_profile_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transaction_profile_idx ON public.transaction USING btree ("profileId");


--
-- Name: transaction_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transaction_type_idx ON public.transaction USING btree (type);


--
-- Name: user_active_profile_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_active_profile_idx ON public.profile USING btree ("userId", "isActive");


--
-- Name: user_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_created_at_idx ON public."user" USING btree ("createdAt");


--
-- Name: user_username_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_username_email_idx ON public."user" USING btree (username, email);


--
-- Name: profile profile_update_balance_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER profile_update_balance_trigger AFTER UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.notify_profile_balance_change();


--
-- Name: bank Bank_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank
    ADD CONSTRAINT "Bank_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.operator(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: chatmessage ChatMessage_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatmessage
    ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public.chatroom(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chatmessage ChatMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatmessage
    ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: chatroom ChatRoom_gameSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatroom
    ADD CONSTRAINT "ChatRoom_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES public.gamesession(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: friendship Friendship_friendId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendship
    ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: friendship Friendship_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendship
    ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gamesession GameSession_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamesession
    ADD CONSTRAINT "GameSession_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.operatorgame(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gamesession GameSession_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamesession
    ADD CONSTRAINT "GameSession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gamesession GameSession_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamesession
    ADD CONSTRAINT "GameSession_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public.tournament(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: operatorgame OperatorGame_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operatorgame
    ADD CONSTRAINT "OperatorGame_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.operator(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: operator Operator_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operator
    ADD CONSTRAINT "Operator_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: profile Profile_bankId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "Profile_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES public.bank(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profile Profile_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "Profile_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.operator(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profile Profile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tournamententry TournamentEntry_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournamententry
    ADD CONSTRAINT "TournamentEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tournamententry TournamentEntry_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournamententry
    ADD CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public.tournament(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tournamententry TournamentEntry_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournamententry
    ADD CONSTRAINT "TournamentEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tournamentgame TournamentGame_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournamentgame
    ADD CONSTRAINT "TournamentGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.operatorgame(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tournamentgame TournamentGame_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournamentgame
    ADD CONSTRAINT "TournamentGame_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public.tournament(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tournament Tournament_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournament
    ADD CONSTRAINT "Tournament_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.operator(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transaction Transaction_gameSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT "Transaction_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES public.gamesession(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transaction Transaction_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT "Transaction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: userachievement UserAchievement_achievementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userachievement
    ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES public.achievement(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: userachievement UserAchievement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userachievement
    ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user User_activeProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "User_activeProfileId_fkey" FOREIGN KEY ("activeProfileId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

