import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatgptService } from './chatgpt.service';
import { ChatgptController } from './chatgpt.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule,ConfigModule],
  controllers: [ChatgptController],
  providers: [ChatgptService],
  exports: [ChatgptService], 
})
export class ChatgptModule {}
