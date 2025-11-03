import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { FIREBASE_DB } from '../firebase/firebase.module';
import { Timestamp } from 'firebase-admin/firestore';
import { CryptoService } from '../crypto/crypto.service';

interface EncryptedData {
  iv: string;
  authTag: string;
  ciphertext: string;
}

interface StoredMessageDocument {
  id: string;
  userEmail: string;
  userName: string;
  content?: string;
  media?: string;
  timestamp: Timestamp;
}

export interface MessageDocument {
  id: string;
  userEmail: string;
  userName: string;
  content?: string;
  media?: string;
  timestamp: Timestamp;
}

export interface CreateMessageDto {
  content?: string;
  media?: string;
}

const MESSAGES_COLLECTION = 'messages';
const MESSAGES_PER_PAGE = 10;

@Injectable()
export class MessagesService {
  constructor(
    @Inject(FIREBASE_DB) private readonly firestore: Firestore,
    private readonly cryptoService: CryptoService,
  ) {}

  async createMessage(
    userEmail: string,
    userName: string,
    dto: CreateMessageDto,
  ): Promise<MessageDocument> {
    const messageRef = this.firestore.collection(MESSAGES_COLLECTION).doc();

    const messageData: any = {
      userEmail,
      userName,
      timestamp: Timestamp.now(),
    };

    if (
      dto.content !== undefined &&
      dto.content !== null &&
      dto.content !== ''
    ) {
      const encryptedContent = this.cryptoService.encrypt(dto.content);
      messageData.content = JSON.stringify(encryptedContent);
    }
    if (dto.media !== undefined && dto.media !== null && dto.media !== '') {
      const encryptedMedia = this.cryptoService.encrypt(dto.media);
      messageData.media = JSON.stringify(encryptedMedia);
    }

    await messageRef.set(messageData);

    return {
      id: messageRef.id,
      userEmail,
      userName,
      content: dto.content,
      media: dto.media,
      timestamp: messageData.timestamp,
    };
  }

  private decryptMessage(storedDoc: StoredMessageDocument): MessageDocument {
    let content: string | undefined;
    let media: string | undefined;

    if (storedDoc.content) {
      try {
        const encryptedData: EncryptedData = JSON.parse(storedDoc.content);
        if (
          encryptedData.iv &&
          encryptedData.authTag &&
          encryptedData.ciphertext
        ) {
          content = this.cryptoService.decrypt(encryptedData);
        } else {
          content = storedDoc.content;
        }
      } catch (error) {
        content = storedDoc.content;
      }
    }

    if (storedDoc.media) {
      try {
        const encryptedData: EncryptedData = JSON.parse(storedDoc.media);
        if (
          encryptedData.iv &&
          encryptedData.authTag &&
          encryptedData.ciphertext
        ) {
          media = this.cryptoService.decrypt(encryptedData);
        } else {
          media = storedDoc.media;
        }
      } catch (error) {
        media = storedDoc.media;
      }
    }

    return {
      id: storedDoc.id,
      userEmail: storedDoc.userEmail,
      userName: storedDoc.userName,
      content,
      media,
      timestamp: storedDoc.timestamp,
    };
  }

  async getLatestMessages(limit: number = MESSAGES_PER_PAGE): Promise<{
    messages: MessageDocument[];
    hasMore: boolean;
    oldestMessageId?: string;
  }> {
    const query = this.firestore
      .collection(MESSAGES_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(limit + 1);

    const snapshot = await query.get();
    const docs = snapshot.docs;
    const hasMore = docs.length > limit;

    const messages = hasMore ? docs.slice(0, -1) : docs;

    const storedDocuments = messages.reverse().map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoredMessageDocument[];

    const messageDocuments = storedDocuments.map((doc) =>
      this.decryptMessage(doc),
    );

    return {
      messages: messageDocuments,
      hasMore,
      oldestMessageId:
        messageDocuments.length > 0 ? messageDocuments[0].id : undefined,
    };
  }

  async getOlderMessages(
    oldestMessageId: string,
    limit: number = MESSAGES_PER_PAGE,
  ): Promise<{
    messages: MessageDocument[];
    hasMore: boolean;
    oldestMessageId?: string;
  }> {
    const oldestDoc = await this.firestore
      .collection(MESSAGES_COLLECTION)
      .doc(oldestMessageId)
      .get();

    if (!oldestDoc.exists) {
      return { messages: [], hasMore: false };
    }

    const query = this.firestore
      .collection(MESSAGES_COLLECTION)
      .orderBy('timestamp', 'desc')
      .startAfter(oldestDoc)
      .limit(limit + 1);

    const snapshot = await query.get();
    const docs = snapshot.docs;
    const hasMore = docs.length > limit;

    const messages = hasMore ? docs.slice(0, -1) : docs;

    const storedDocuments = messages.reverse().map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoredMessageDocument[];

    const messageDocuments = storedDocuments.map((doc) =>
      this.decryptMessage(doc),
    );

    return {
      messages: messageDocuments,
      hasMore,
      oldestMessageId:
        messageDocuments.length > 0 ? messageDocuments[0].id : undefined,
    };
  }

  async getLastMessages(limit: number = 20): Promise<MessageDocument[]> {
    const query = this.firestore
      .collection(MESSAGES_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await query.get();
    const docs = snapshot.docs.reverse();

    const storedDocuments = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoredMessageDocument[];

    return storedDocuments.map((doc) => this.decryptMessage(doc));
  }
}
