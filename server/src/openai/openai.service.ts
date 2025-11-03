import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface MessageContext {
  userName: string;
  content?: string;
  media?: string;
}

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateResponse(
    messages: MessageContext[],
  ): Promise<string> {
    try {
      if (!messages || messages.length === 0) {
        throw new Error('No messages provided for AI context');
      }

      const formattedMessages = messages
        .filter((msg) => msg.content && msg.content.trim().length > 0)
        .map((msg) => ({
          role: 'user' as const,
          content: `${msg.userName}: ${msg.content}`,
        }));

      if (formattedMessages.length === 0) {
        formattedMessages.push({
          role: 'user' as const,
          content: 'Recent conversation activity',
        });
      }

      const systemMessage = {
        role: 'system' as const,
        content:
          'You are a helpful AI assistant in a group chat. Provide concise, natural responses based on the conversation context. Keep responses brief (2-3 sentences max). Do not include your name or label at the start of responses.',
      };

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...formattedMessages],
        max_tokens: 300,
        temperature: 0.7,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('OpenAI returned an empty response');
      }

      let content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI response has no content');
      }

      content = content.trim();
      const aiAssistantPrefixes = [
        /^AI Assistant:\s*/i,
        /^AI Assistant\s*/i,
        /^Assistant:\s*/i,
        /^Assistant\s*/i,
      ];

      for (const prefix of aiAssistantPrefixes) {
        content = content.replace(prefix, '').trim();
      }

      return content;
    } catch (error: any) {
      if (error?.status) {
        const status = error.status;
        const errorMessage = error.message || 'Unknown OpenAI API error';
        const errorCode = error.code || 'unknown';

        if (status === 401) {
          throw new Error('OpenAI API key is invalid or missing');
        } else if (status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (status === 500) {
          throw new Error('OpenAI API server error. Please try again later.');
        } else if (status === 503) {
          throw new Error('OpenAI API is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`OpenAI API error (${status}): ${errorMessage} (Code: ${errorCode})`);
        }
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(`Failed to generate AI response: ${String(error)}`);
    }
  }
}
