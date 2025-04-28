import { ApiProperty } from "@nestjs/swagger";

export class ChatRoomDto {
  id: string;
  name: string;
  isGameRoom: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  gameSessionId: string | null;
}
