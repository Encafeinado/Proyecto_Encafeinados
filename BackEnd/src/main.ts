import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Configuración de body parser para manejar tamaños de solicitud más grandes
  app.use(bodyParser.json({ limit: '50mb' })); // Ajusta el límite según tus necesidades
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Ajusta el límite según tus necesidades

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  console.log("Escuchando en puerto", process.env.PORT ?? 3000);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
