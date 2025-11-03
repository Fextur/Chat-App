import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
