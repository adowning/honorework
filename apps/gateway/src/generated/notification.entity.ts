import { Prisma, NotificationType } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./user.entity";

export class Notification {
  id: string;
  @ApiProperty({
    enum: NotificationType,
  })
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  readAt: Date | null;
  metadata: Prisma.JsonValue | null;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  user?: User;
  userId: string;
}
