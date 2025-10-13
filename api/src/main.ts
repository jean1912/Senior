import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { seedAlgorithms } from './algorithms/algorithm.seed'; 
import { DataSource } from 'typeorm';
import { VisualizationSeeder } from './visualizations/visualization.seeder';
import { VisualizationSeederModule } from './visualizations/visualization-seeder.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

    // 1️⃣ Seed algorithms first
    await seedAlgorithms(dataSource);

    // 2️⃣ Then seed visualizations (depends on algorithms)
    const visualizationSeederModule = app.select(VisualizationSeederModule);
    const visualizationSeeder = visualizationSeederModule.get(VisualizationSeeder);
    await visualizationSeeder.seed();

    console.log('✅ All seeding complete!');
  } else {
    console.log('🚫 Seeding skipped (production mode)');
  }
}

bootstrap();
