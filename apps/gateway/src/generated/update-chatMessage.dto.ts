import { Prisma, ChatChannel } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateChatMessageDto {
  content?: string;
  @ApiProperty({
    enum: ChatChannel,
  })
  channel?: ChatChannel;
  metadata?: Prisma.InputJsonValue;
}
