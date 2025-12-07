import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// 🔐 Core modules
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

// 🤖 ChatGPT Enhance
import { ChatgptModule } from './gptEnhance/chatgpt.module';
import { AiConvoModule } from './ai/ai-convo.module';

// 🧠 Algorithms & Visualization
import { AlgorithmsModule } from './algorithms/algorithms.module';
import { VisualizationModule } from './visualizations/visualization.module';

// 🧩 Algorithm Builder Modules
import { BlocksModule } from './algorithms/blocks.module';
import { TemplatesModule } from './algorithms/templates.module';

// 📝 NEW: Exercises & Submissions
import { ExercisesModule } from './exercises/exercises.module';
import { SubmissionsModule } from './submissions/submissions.module';

// (Optional — only include if you add metrics tracking later)
// import { ExecutionMetricsModule } from './algorithms/execution-metrics.module';

@Module({
  imports: [
    // 🌍 Global .env config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 🗄 Database
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

    
    // 🔐 Core App Modules
    AuthModule,
    UserModule,
    ChatgptModule,
     AiConvoModule,

    // 🧠 Algorithm & Visualization Modules
    AlgorithmsModule,
    VisualizationModule,

    // 🧩 Algorithm Builder Enhancements
    BlocksModule,
    TemplatesModule,

    // 📝 NEW: Exercises + Submissions
    ExercisesModule,
    SubmissionsModule,

    // ExecutionMetricsModule, // Uncomment when adding metrics
  ],
})
export class AppModule {}
