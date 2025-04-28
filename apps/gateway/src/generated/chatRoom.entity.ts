import { ApiProperty } from "@nestjs/swagger";
import { GameSession } from "./gameSession.entity";
import { ChatMessage } from "./chatMessage.entity";

export class ChatRoom {
  id: string;
  name: string;
  isGameRoom: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  gameSession?: GameSession | null;
  gameSessionId: string | null;
  messages?: ChatMessage[];
}
