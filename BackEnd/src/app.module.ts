import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ShopModule } from './shop/shop.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { ReviewModule } from './reviews/review.module';
import { AdminModule } from './admin/admin.module';
import { PaymentModule } from './payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    ScheduleModule.forRoot(),  // Habilita el soporte para cron jobs
    ShopModule,
    AdminModule,
    AuthModule,
    BookModule,
    ReviewModule,
    PaymentModule,
  ],
})
export class AppModule {}
