import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { auth } from 'firebase-admin';
import { FIREBASE_AUTH } from '../firebase/firebase.module';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(FIREBASE_AUTH) private readonly firebaseAuth: auth.Auth,
    private readonly cryptoService: CryptoService,
  ) {}

  async verifyIdToken(idToken: string): Promise<auth.DecodedIdToken> {
    try {
      if (!idToken) {
        throw new UnauthorizedException('ID token is required');
      }
      const decodedToken = await this.firebaseAuth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.code || 'Invalid ID token';
      throw new UnauthorizedException(
        `Invalid ID token: ${errorMessage}`,
      );
    }
  }

  async createAccessToken(uid: string): Promise<string> {
    const userRecord = await this.firebaseAuth.getUser(uid);
    
    const payload = {
      uid,
      email: userRecord.email,
      name: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const encrypted = this.cryptoService.encrypt(JSON.stringify(payload));
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }

  async createAccessTokenAndUser(uid: string): Promise<{
    accessToken: string;
    user: { email: string | undefined; name: string };
  }> {
    const userRecord = await this.firebaseAuth.getUser(uid);
    const name = userRecord.displayName || userRecord.email?.split('@')[0] || 'User';
    
    const payload = {
      uid,
      email: userRecord.email,
      name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const encrypted = this.cryptoService.encrypt(JSON.stringify(payload));
    const accessToken = Buffer.from(JSON.stringify(encrypted)).toString('base64');

    return {
      accessToken,
      user: {
        email: userRecord.email,
        name,
      },
    };
  }

  async verifyAccessToken(accessToken: string): Promise<{
    uid: string;
    email: string | undefined;
    name: string;
  }> {
    try {
      const encryptedData: {
        iv: string;
        authTag: string;
        ciphertext: string;
      } = JSON.parse(Buffer.from(accessToken, 'base64').toString('utf8'));
      
      const decrypted = this.cryptoService.decrypt(encryptedData);
      const payload = JSON.parse(decrypted);

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new UnauthorizedException('Token expired');
      }

      await this.firebaseAuth.getUser(payload.uid);

      return {
        uid: payload.uid,
        email: payload.email,
        name: payload.name,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }
}

