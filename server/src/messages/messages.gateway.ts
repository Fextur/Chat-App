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
      const userAgent = client.handshake.headers['user-agent'] || 'unknown';
      console.log(`[WebSocket] Connection attempt from ${userAgent}`);
      console.log(`[WebSocket] Cookies received: ${cookies ? 'yes' : 'no'}`);
      if (cookies) {
        console.log(`[WebSocket] Cookie string length: ${cookies.length}`);
      }
      
      const accessToken = this.extractAccessToken(cookies);

      if (!accessToken) {
        console.log('[WebSocket] No access token found, disconnecting');
        if (cookies) {
          console.log('[WebSocket] Cookie string (first 200 chars):', cookies.substring(0, 200));
          // Check if accessToken is in the string at all
          if (cookies.includes('accessToken')) {
            console.log('[WebSocket] Found "accessToken" in cookie string, but extraction failed');
          }
        }
        client.disconnect();
        return;
      }

      console.log(`[WebSocket] Access token extracted, length: ${accessToken.length}, first 20 chars: ${accessToken.substring(0, 20)}`);
      
      const user = await this.authService.verifyAccessToken(accessToken);
      client.join('chat');
      console.log(`[WebSocket] User ${user.email} connected and joined chat room`);
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('[WebSocket] Error message:', error.message);
      }
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    // Cleanup if needed
  }

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
    try {
      // Get room info if available
      let clientCount = 0;
      if (this.server.sockets.adapter?.rooms) {
        const socketsInRoom = this.server.sockets.adapter.rooms.get('chat');
        clientCount = socketsInRoom ? socketsInRoom.size : 0;
      }
      console.log(`[WebSocket] Emitting new message ${message.id} to ${clientCount} clients in chat room`);
      this.server.to('chat').emit('newMessage', message);
    } catch (error) {
      console.error('[WebSocket] Error emitting message:', error);
      // Still try to emit even if room counting fails
      this.server.to('chat').emit('newMessage', message);
    }
  }

  private extractAccessToken(cookies: string): string | null {
    if (!cookies) {
      return null;
    }
    
    // Try multiple patterns to handle different cookie formats
    // Pattern 1: accessToken=value (most common)
    let match = cookies.match(/(?:^|;\s*)accessToken=([^;]*)/);
    if (match && match[1]) {
      const value = match[1].trim();
      // Try to decode, but catch errors in case it's already decoded
      try {
        return decodeURIComponent(value);
      } catch (e) {
        // If decoding fails, return the raw value
        return value;
      }
    }
    
    // Pattern 2: handle URL encoded cookies (accessToken%3Dvalue)
    match = cookies.match(/accessToken%3D([^;]*)/);
    if (match && match[1]) {
      try {
        return decodeURIComponent(match[1].trim());
      } catch (e) {
        return match[1].trim();
      }
    }
    
    // Pattern 3: split by semicolon and find accessToken
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

