import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './shop.service';
import { AuthController } from './shop.controller';
import { Shop , ShopSchema } from './entities/shop.entity';


@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[
    ConfigModule.forRoot(),

    MongooseModule.forFeature([
      {
        name: Shop.name,
        schema: ShopSchema
      }
    ]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h' },
    }),
  ]
  
})
export class AuthModule {}
