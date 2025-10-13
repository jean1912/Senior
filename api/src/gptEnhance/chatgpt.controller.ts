import { Controller, Post, Body } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
//names and for calling the contructor
@Controller('gptEnhance')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}
//creates an enhance form
  @Post('enhance')
  async enhance(@Body() body: { prompt: string }) {
    try {
      const enhanced = await this.chatgptService.enhanceRecipe(body.prompt);
      return { enhanced };
    } catch (err) {
      console.error('🔥 Error in enhance controller:', err);
      throw err;
    }
  }
}
