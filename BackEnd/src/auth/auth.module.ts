// src/auth/auth.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './entities/user.entity';
import { Book, BookSchema } from '../book/entities/book.entity';
import { MailModule } from './mail/mail.module';
import { Shop, ShopSchema } from 'src/shop/entities/shop.entity';
import { ShopModule } from 'src/shop/shop.module';

@Module({
  imports: [
    forwardRef(() => ShopModule),
    MailModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, MongooseModule], // Exporta MongooseModule aquí
})
export class AuthModule {}
