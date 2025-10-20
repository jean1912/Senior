import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { seedAlgorithms } from './algorithms/algorithm.seed';
import { DataSource } from 'typeorm';
import * as bodyParser from 'body-parser'; // ✅ add this

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ enable body parsing for JSON requests
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // ✅ Enable CORS for frontend requests
  app.enableCors();

  // ✅ Serve static uploaded files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ Start the application
  await app.listen(3008);
  const url = await app.getUrl();
  console.log(`🚀 Application is running on: ${url}`);

  // ✅ Access database connection
  const dataSource = app.get(DataSource);

  // ✅ Run seeders only in development or when SEED=true
  if (process.env.SEED === 'true' || process.env.NODE_ENV !== 'production') {
    console.log('🌱 Seeding database...');
    await seedAlgorithms(dataSource);
    console.log('✅ Algorithm seeding complete!');
  } else {
    console.log('🚫 Seeding skipped (production mode)');
  }
}

bootstrap();
