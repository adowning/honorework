import { FriendshipStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./user.entity";

export class Friendship {
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
  user?: User;
  userId: string;
  friend?: User;
  friendId: string;
}
