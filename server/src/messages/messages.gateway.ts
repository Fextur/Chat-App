import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly authService: AuthService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie || '';
      let accessToken = this.extractAccessToken(cookies);

      if (!accessToken) {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          accessToken = authHeader.substring(7);
        }
      }

      if (!accessToken) {
        const authData = client.handshake.auth as { token?: string };
        if (authData?.token) {
          accessToken = authData.token;
        }
      }

      if (!accessToken) {
        client.disconnect();
        return;
      }

      const user = await this.authService.verifyAccessToken(accessToken);
      client.data.user = user;
      client.join('chat');
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {}

  emitNewMessage(message: {
    id: string;
    user: {
      email: string | undefined;
      name: string;
    };
    content?: string;
    media?: string;
    timestamp: string;
  }) {
    this.server.to('chat').emit('newMessage', message);
  }

  private extractAccessToken(cookies: string): string | null {
    if (!cookies) {
      return null;
    }

    let match = cookies.match(/(?:^|;\s*)accessToken=([^;]*)/);
    if (match && match[1]) {
      const value = match[1].trim();
      try {
        return decodeURIComponent(value);
      } catch (e) {
        return value;
      }
    }

    match = cookies.match(/accessToken%3D([^;]*)/);
    if (match && match[1]) {
      try {
        return decodeURIComponent(match[1].trim());
      } catch (e) {
        return match[1].trim();
      }
    }

    const cookieParts = cookies.split(';');
    for (const part of cookieParts) {
      const trimmed = part.trim();
      if (trimmed.startsWith('accessToken=')) {
        const value = trimmed.substring('accessToken='.length).trim();
        try {
          return decodeURIComponent(value);
        } catch (e) {
          return value;
        }
      }
    }

    return null;
  }
}
