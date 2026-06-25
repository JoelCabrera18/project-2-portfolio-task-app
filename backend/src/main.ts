import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  // Logger
  const logger = new Logger('Bootstrap');

  // Configuración de la aplicación
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // Confiar en proxies si está detrás de reverse proxy (Nginx, Cloudflare, etc.)
  const trustProxy = process.env.TRUST_PROXY || 'loopback';
  app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);

  // Seguridad HTTP con Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
          connectSrc: ["'self'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS restringido al frontend
  const frontendUrl = process.env.HOST_FRONTEND || 'http://localhost:4200';
  app.enableCors({
    origin: [frontendUrl],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Task App')
    .setDescription('Task App API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Iniciar la aplicación
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on port: ${process.env.PORT}`);
}
bootstrap();
