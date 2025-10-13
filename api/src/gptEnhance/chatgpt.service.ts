import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

// Decorator to mark service as injectable
@Injectable()
export class ChatgptService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
// Method to enhance a recipe description by calling OpenAI's API
  async enhanceRecipe(prompt: string): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    console.log('🔑 OpenAI API Key:', apiKey);
  
    if (!apiKey) {
      throw new Error('❌ OpenAI API key not found in environment variables!');
    }
  
    const endpoint = 'https://api.openai.com/v1/chat/completions';
  
    try {
      const response = await this.httpService.axiosRef.post(
        endpoint,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );
  
      console.log('✅ OpenAI response:', response.data);
  
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('🔥 Error calling OpenAI API:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to call OpenAI API');
    }
  }
  
  }