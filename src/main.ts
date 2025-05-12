import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { join } from 'path';
import fastifySecureSession from '@fastify/secure-session';
import fastifyCookie from '@fastify/cookie';
import fastifyView from '@fastify/view';
import * as passport from 'passport';
import * as ejs from 'ejs';
import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import fastifyStatic from '@fastify/static';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  // Register cookies and session
  await app.register(fastifyCookie);
  await app.register(fastifySecureSession, {
    key: Buffer.from('a'.repeat(32)), // 32 bytes key
    cookie: {
      path: '/',
    },
  });

  app.use(passport.initialize());

  // Register EJS view engine
  await app.register(fastifyView, {
    engine: {
      ejs: ejs, // Thay Handlebars bằng EJS
    },
    root: join(__dirname, '..', 'views'), // Đường dẫn đến thư mục views của bạn
    includeViewExtension: true,
  });

  app.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/static/', // Truy cập qua http://localhost:7979/static/...
  });

  app.register(fastifyMultipart);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:7979'],
    credentials: true,
  });

  const port = configService.get('app.port') || 3000;
  await app.listen(port, () => {
    console.log(`>>> Server running on PORT: ${port}`);
  });
}
bootstrap();
