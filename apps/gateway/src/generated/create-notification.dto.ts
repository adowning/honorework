import { Prisma, NotificationType } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
  })
  type: NotificationType;
  title: string;
  message: string;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  readAt?: Date;
  metadata?: Prisma.InputJsonValue;
}
