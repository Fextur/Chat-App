import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const FIREBASE_AUTH = 'FIREBASE_AUTH';
export const FIREBASE_DB = 'FIREBASE_DB';
export const FIREBASE_STORAGE = 'FIREBASE_STORAGE';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_APP',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const storageBucket =
          cfg.get<string>('FIREBASE_STORAGE_BUCKET_ID') || undefined;
        const useADC = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

        if (useADC) {
          return admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket,
          });
        }

        const projectId = cfg.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = cfg.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = cfg
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
          throw new Error(
            'Firebase Admin credentials are missing. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_* envs.',
          );
        }

        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          storageBucket,
        });
      },
    },
    {
      provide: FIREBASE_AUTH,
      inject: ['FIREBASE_APP'],
      useFactory: (app: admin.app.App) => app.auth(),
    },
    {
      provide: FIREBASE_DB,
      inject: ['FIREBASE_APP'],
      useFactory: (app: admin.app.App) => app.firestore(),
    },
    {
      provide: FIREBASE_STORAGE,
      inject: ['FIREBASE_APP'],
      useFactory: (app: admin.app.App) => app.storage(),
    },
  ],
  exports: [FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE],
})
export class FirebaseModule {}
