import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './entities/reviews.entity';
import { RegisterReviewDto } from './dto/register-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async getAllReviews(): Promise<ReviewDocument[]> {
    try {
      return await this.reviewModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving reviews');
    }
  }

  async addReview(registerReviewDto: RegisterReviewDto): Promise<ReviewDocument> {
    try {
      const newReview = new this.reviewModel({ review: registerReviewDto.review });  // Usa 'review' aquí
      return await newReview.save();
    } catch (error) {
      console.error('Error adding review:', error);  // Agrega un log del error para más detalles
      throw new InternalServerErrorException('Error adding review');
    }
  }
}
