import { FriendshipStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class FriendshipDto {
  id: string;
  @ApiProperty({
    enum: FriendshipStatus,
  })
  status: FriendshipStatus;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  updatedAt: Date;
  userId: string;
  friendId: string;
}
