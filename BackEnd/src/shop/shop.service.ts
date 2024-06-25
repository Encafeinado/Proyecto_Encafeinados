import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { RegisterShopDto } from './dto';
import { Shop } from './entities/shop.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponce } from './interfaces/login-responce';




@Injectable()
export class ShopService {

  constructor(
    @InjectModel(Shop.name)
    
    private shopModel: Model<Shop>,
    private jwtService: JwtService
  ){
}

  async create(createShopDto: RegisterShopDto): Promise<Shop>{

      try {
        const { password, ...shopData} = createShopDto;

        const newShop = new this.shopModel( {
          password: bcryptjs.hashSync(password, 10),
          ...shopData
      });
       await newShop.save();
      const {password:_,... shop} = newShop.toJSON();

      return shop;

      } catch (error) {
       if(error.code === 11000){
        throw new BadRequestException(`${createShopDto.email} Ya Existe!`)
       }
        throw new InternalServerErrorException('Algo terrible esta sucediendo!!!!')
      }

  }

  async register(registerDto: RegisterShopDto): Promise<LoginResponce>{
    
    const shop = await this.create(registerDto)
    console.log({shop});
    return{
      shop: shop,
      token: this.getJwtToken({id: shop._id})
    }

  }


 

  findAll(): Promise<Shop[]> {
    return this.shopModel.find();
  }

 async findShopById(id: string){
  const shop = await this.shopModel.findById(id);
  const { password, ...rest} = shop.toJSON();
  return rest;
}

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;

  }
}
