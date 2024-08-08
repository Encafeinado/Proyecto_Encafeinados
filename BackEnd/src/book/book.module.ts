import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './entities/book.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { ShopModule } from 'src/shop/shop.module';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/auth/entities/user.entity';
import { Shop, ShopSchema } from 'src/shop/entities/shop.entity';

@Module({
  controllers: [BookController],
  providers: [BookService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: Book.name,
        schema: BookSchema,
      },
    ]),
    MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ShopModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h' },
    }),
  ],
})
export class BookModule {}
