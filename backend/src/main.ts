import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  // Serve compiled React frontend if frontend/dist exists
  const distCandidates = [
    join(process.cwd(), '../frontend/dist'),
    join(process.cwd(), 'frontend/dist'),
  ];
  const frontendDistPath = distCandidates.find((p) => existsSync(p));

  if (frontendDistPath) {
    app.useStaticAssets(frontendDistPath);
    // SPA fallback: any non-API GET request serves index.html
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get(/^(?!\/api).*/, (_req: any, res: any) => {
      res.sendFile(join(frontendDistPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n======================================================`);
  console.log(`🚀 IT DISPATCH SYSTEM IS HOSTED & RUNNING`);
  console.log(`👉 Web Portal (Unified Fullstack): http://localhost:${port}`);
  console.log(`👉 Backend REST API: http://localhost:${port}/api`);
  console.log(`======================================================\n`);
}
await bootstrap();
