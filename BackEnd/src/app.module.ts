import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ShopModule } from './shop/shop.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    ShopModule,
    AuthModule,
    BookModule
  ],
})
export class AppModule {}

