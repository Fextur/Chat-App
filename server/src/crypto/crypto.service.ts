import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class CryptoService {
  private key: Buffer;

  constructor() {
    const b64 = process.env.ENCRYPTION_KEY_BASE64;
    if (!b64) throw new Error('ENCRYPTION_KEY_BASE64 missing');
    const raw = Buffer.from(b64, 'base64');
    if (raw.length !== 32) {
      throw new Error('ENCRYPTION_KEY_BASE64 must be 32 bytes (Base64)');
    }
    this.key = raw;
  }

  encrypt(plaintext: string): {
    iv: string;
    authTag: string;
    ciphertext: string;
  } {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return {
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      ciphertext: ciphertext.toString('base64'),
    };
  }

  decrypt(payload: {
    iv: string;
    authTag: string;
    ciphertext: string;
  }): string {
    const iv = Buffer.from(payload.iv, 'base64');
    const authTag = Buffer.from(payload.authTag, 'base64');
    const data = Buffer.from(payload.ciphertext, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
    return plaintext.toString('utf8');
  }

  async hash(value: string): Promise<string> {
    return argon2.hash(value, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 19456,
      parallelism: 1,
    });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
