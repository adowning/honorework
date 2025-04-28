import { Prisma, ChatChannel } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./user.entity";
import { ChatRoom } from "./chatRoom.entity";

export class ChatMessage {
  id: string;
  content: string;
  @ApiProperty({
    enum: ChatChannel,
  })
  channel: ChatChannel;
  metadata: Prisma.JsonValue | null;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  user?: User;
  userId: string;
  room?: ChatRoom | null;
  roomId: string | null;
}
