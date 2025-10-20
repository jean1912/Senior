import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ChatgptModule } from './gptEnhance/chatgpt.module';
import { UserModule } from './user/user.module'
import {AlgorithmsModule} from './algorithms/algorithms.module';  
import { VisualizationModule } from './visualizations/visualization.module';





@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),
   
    AuthModule,
    ChatgptModule,
    UserModule,
    AlgorithmsModule,
    VisualizationModule,
   
    
  ],
})
export class AppModule {}
