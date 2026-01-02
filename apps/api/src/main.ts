import { NestFactory } from '@nestjs/core';
import bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // 綠界 callback 為 application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
