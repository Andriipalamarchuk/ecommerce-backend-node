import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useLogger(
    (process.env.LOG_LEVELS.split(',') || ['error', 'warn']) as LogLevel[],
  );
  const port = process.env['API_PORT'] ?? 3000;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
