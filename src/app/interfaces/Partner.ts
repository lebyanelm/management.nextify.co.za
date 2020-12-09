import { Driver } from './Driver';
import { Extra } from './Extra';
import { Branch } from './Branch';
import { Sales } from './Sales';
import { Promocode } from './Promocode';
import { Product } from './Product';
import { Media } from './Media';
import { TimeCreated } from './TimeCreated';
import { Customer } from './Customer';
import { Login } from './Login';
import { Banner } from './Banner';
export interface Partner {
  timeCreated: TimeCreated;
  id: string;
  emailAddress: string;
  businessName: string;
  address: string;
  media: Media[];
  locations: any[];
  phoneNumber: string;
  gender: number;
  isVerified: [boolean, boolean];
  isOnline: boolean;
  orders: any;
  isTwoFactorLogin: boolean;
  type: string;
  completedOrders: any;
  deliveryRange: number;
  products: Product[];
  branches: Branch[];
  transactions: [];
  users: Customer[];
  promocodes: Promocode[];
  sales: Sales;
  token?: string;
  trustedLogins: Login[];
  extras: Extra[];
  banners: Banner[];
  drivers: Driver[];
  messages: any;
  snapshots: {
    totalEarnings: number,
    quantitiesSold: number,
    customerAvg: number,
    totalOrders: number
  };
  customers: string[];
}
