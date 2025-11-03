import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async getMessages(
    @Query('limit') limit?: string,
    @Query('oldestMessageId') oldestMessageId?: string,
    @Req() req?: Request,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const validatedLimit = Math.min(Math.max(limitNum, 1), 50);

    const result = oldestMessageId
      ? await this.messagesService.getOlderMessages(oldestMessageId, validatedLimit)
      : await this.messagesService.getLatestMessages(validatedLimit);

    const messages = result.messages.map((msg) => ({
      id: msg.id,
      user: {
        email: msg.userEmail,
        name: msg.userName,
      },
      content: msg.content,
      media: msg.media,
      timestamp: msg.timestamp.toDate().toISOString(),
    }));

    return {
      messages,
      hasMore: result.hasMore,
      oldestMessageId: result.oldestMessageId,
    };
  }

  @Post()
  async createMessage(
    @Body() dto: { content?: string; media?: string },
    @Req() req: Request,
  ) {
    const user = req['user'];
    
    const messageDoc = await this.messagesService.createMessage(
      user.email,
      user.name,
      dto,
    );

    return {
      id: messageDoc.id,
      user: {
        email: messageDoc.userEmail,
        name: messageDoc.userName,
      },
      content: messageDoc.content,
      media: messageDoc.media,
      timestamp: messageDoc.timestamp.toDate().toISOString(),
    };
  }
}
