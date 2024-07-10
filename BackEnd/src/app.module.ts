import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ShopModule } from './shop/shop.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { UploadController } from './upload/upload.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    BookModule,
    ShopModule,
    AuthModule,
  ],
  controllers: [UploadController],
})
export class AppModule {}
