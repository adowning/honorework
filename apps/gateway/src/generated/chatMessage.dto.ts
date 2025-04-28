import { Prisma, ChatChannel } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class ChatMessageDto {
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
  userId: string;
  roomId: string | null;
}
