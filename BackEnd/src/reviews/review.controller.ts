import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ReviewService } from './review.service';
import { RegisterReviewDto } from './dto/register-review.dto';
import { ReviewDocument } from './entities/reviews.entity';

@Controller('review')  // Aquí se define la base de la ruta
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/allReviews')
  async getAllReviews(): Promise<ReviewDocument[]> {
    return this.reviewService.getAllReviews();
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterReviewDto) {
    const review = await this.reviewService.addReview(registerDto);

    return {
      review,
      message: 'Review registrada exitosamente',
    };
  }
}
