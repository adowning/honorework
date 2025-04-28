import { Prisma, NotificationType } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationDto {
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
  userId: string;
}
