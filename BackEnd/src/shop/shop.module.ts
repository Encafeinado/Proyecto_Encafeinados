import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { Shop , ShopSchema } from './entities/shop.entity';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports:[
    AuthModule,
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
export class ShopModule {}
