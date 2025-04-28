// chat.service.ts
import { Logger } from '@thanhhoajs/logger'
import { db } from '../db'
import { chatmessage, chatroom, user } from '../generated/drizzle/schema'
import { eq, and, asc, sql } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

type ChatMessage = InferSelectModel<typeof chatmessage>
type ChatRoom = InferSelectModel<typeof chatroom>
type User = InferSelectModel<typeof user>

export class ChatService {
  private readonly logger = Logger.get(ChatService.name)

  constructor() {}

  async createMessage(
    roomId: string,
    id: string,
    userId: string,
    content: string,
    channel: 'LOBBY' | 'GAME' | 'TOURNAMENT' | 'PRIVATE',
  ): Promise<ChatMessage> {
    try {
      const [message] = await db
        .insert(chatmessage)
        .values({
          id,
          roomId,
          userId,
          content,
          channel,
          createdAt: sql`CURRENT_TIMESTAMP`,
        })
        .returning()
      this.logger.info(`Message created: ${message.id}`)
      return message
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`)
      throw new Error(`Failed to create message: ${error.message}`)
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await db.delete(chatmessage).where(eq(chatmessage.id, messageId))
      this.logger.info(`Message ${messageId} deleted`)
    } catch (error) {
      this.logger.error(`Error deleting message ${messageId}: ${error.message}`)
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  }

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      return db.query.chatmessage.findMany({
        where: eq(chatmessage.roomId, roomId),
        orderBy: [asc(chatmessage.createdAt)],
        with: {
          user: true,
        },
      })
    } catch (error) {
      this.logger.error(
        `Error fetching messages for room ${roomId}: ${error.message}`,
      )
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }
  }

  async getRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      return db.query.chatroom.findFirst({
        where: eq(chatroom.id, roomId),
        with: {
          messages: {
            orderBy: [asc(chatmessage.createdAt)],
          },
        },
      }) as unknown as ChatRoom
    } catch (error) {
      this.logger.error(`Error fetching room ${roomId}: ${error.message}`)
      throw new Error(`Failed to fetch room: ${error.message}`)
    }
  }

  async createRoom(
    name: string,
    id: string,
    gameSessionId?: string,
  ): Promise<ChatRoom> {
    try {
      const [room] = await db
        .insert(chatroom)
        .values({
          id,
          name,
          isGameRoom: !!gameSessionId,
          gameSessionId,
          createdAt: sql`CURRENT_TIMESTAMP`,
        })
        .returning()
      return room
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`)
      throw new Error(`Failed to create room: ${error.message}`)
    }
  }

  async getRoomsForGameSession(gameSessionId: string): Promise<ChatRoom[]> {
    try {
      return db.query.chatroom.findMany({
        where: eq(chatroom.gameSessionId, gameSessionId),
      })
    } catch (error) {
      this.logger.error(
        `Error fetching rooms for game session ${gameSessionId}: ${error.message}`,
      )
      throw new Error(`Failed to fetch rooms: ${error.message}`)
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      return db.query.user.findFirst({
        where: eq(user.id, userId),
      }) as unknown as User | null
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}: ${error.message}`)
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
  }

  async createUser(username: string, passwordHash: string): Promise<User> {
    try {
      const [newUser] = await db
        .insert(user)
        .values({
          username,
          passwordHash,
          createdAt: sql`CURRENT_TIMESTAMP`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .returning()
      return newUser
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`)
      throw new Error(`Failed to create user: ${error.message}`)
    }
  }
}
