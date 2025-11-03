import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Inject,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import type { UploadApiResponse } from 'cloudinary';
import type { UploadStream } from 'cloudinary';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { AuthGuard } from '../auth/auth.guard';
import { CLOUDINARY } from '../cloudinary/cloudinary.module';
import { OpenAIService } from '../openai/openai.service';

interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway,
    private readonly openAIService: OpenAIService,
    @Inject(CLOUDINARY) private readonly cloudinary: any,
  ) {}

  @Get()
  async getMessages(
    @Query('limit') limit?: string,
    @Query('oldestMessageId') oldestMessageId?: string,
    @Req() req?: Request,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const validatedLimit = Math.min(Math.max(limitNum, 1), 50);

    const result = oldestMessageId
      ? await this.messagesService.getOlderMessages(
          oldestMessageId,
          validatedLimit,
        )
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

    const message = {
      id: messageDoc.id,
      user: {
        email: messageDoc.userEmail,
        name: messageDoc.userName,
      },
      content: messageDoc.content,
      media: messageDoc.media,
      timestamp: messageDoc.timestamp.toDate().toISOString(),
    };

    this.messagesGateway.emitNewMessage(message);

    return message;
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedFileType) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        `File must be an image. Received: ${file.mimetype}`,
      );
    }

    if (!file.buffer) {
      throw new BadRequestException(
        'File buffer is missing. Please try again.',
      );
    }

    return new Promise<{ url: string }>((resolve, reject) => {
      try {
        const uploadStream: UploadStream =
          this.cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'chat-images',
            },
            (
              error: Error | undefined,
              result: UploadApiResponse | undefined,
            ) => {
              if (error) {
                reject(
                  new BadRequestException(
                    `Failed to upload image to Cloudinary: ${error.message || 'Unknown error'}`,
                  ),
                );
              } else if (result) {
                resolve({ url: result.secure_url });
              } else {
                reject(
                  new BadRequestException(
                    'Upload completed but no URL was returned',
                  ),
                );
              }
            },
          );

        uploadStream.on('error', (streamError: Error) => {
          reject(
            new BadRequestException(
              `Upload stream error: ${streamError.message || 'Unknown error'}`,
            ),
          );
        });

        uploadStream.end(file.buffer);
      } catch (catchError) {
        reject(
          new BadRequestException(
            `Failed to setup upload: ${catchError instanceof Error ? catchError.message : 'Unknown error'}`,
          ),
        );
      }
    });
  }

  @Post('ai-assistance')
  async getAIAssistance(@Req() req: Request) {
    try {
      const lastMessages = await this.messagesService.getLastMessages(15);

      if (!lastMessages || lastMessages.length === 0) {
        throw new BadRequestException(
          'No messages found in chat history. Please send some messages first.',
        );
      }

      const messageContext = lastMessages.map((msg) => ({
        userName: msg.userName || 'Unknown User',
        content: msg.content,
        media: msg.media,
      }));

      let aiResponse: string;
      try {
        aiResponse = await this.openAIService.generateResponse(messageContext);
      } catch (error: any) {
        throw new BadRequestException(
          error instanceof Error
            ? error.message
            : 'Failed to generate AI response. Please check server logs for details.',
        );
      }

      if (!aiResponse || aiResponse.trim().length === 0) {
        throw new BadRequestException(
          'AI generated an empty response. Please try again.',
        );
      }

      let aiMessageDoc;
      try {
        aiMessageDoc = await this.messagesService.createMessage(
          'ai-assistant@system',
          'AI Assistant',
          { content: aiResponse },
        );
      } catch (error: any) {
        throw new BadRequestException(
          'Failed to save AI response to database. Please try again.',
        );
      }

      const message = {
        id: aiMessageDoc.id,
        user: {
          email: aiMessageDoc.userEmail,
          name: aiMessageDoc.userName,
        },
        content: aiMessageDoc.content,
        media: aiMessageDoc.media,
        timestamp: aiMessageDoc.timestamp.toDate().toISOString(),
      };

      this.messagesGateway.emitNewMessage(message);

      return message;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please check server logs for details.',
      );
    }
  }
}
