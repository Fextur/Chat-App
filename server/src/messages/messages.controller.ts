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

    // Emit WebSocket event after message is saved
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
}
