export interface PaymentResponse {
    _id: string;
    nameShop: string;
    shopId: string;
    statusPayment: boolean;
    year: number;
    month: number;
    images: Array<{ image: string }>;
    __v: number;
  }