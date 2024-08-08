

export interface Shop {
  _id: string;
  email: string;
  name: string;
  phone: string;
  isActive: boolean;
  roles: string[];
  specialties: string;
  address: string;
  logoUrl?: string;
  verificationCode: string;
  codeUsage: number;
  statusShop: boolean;
}

