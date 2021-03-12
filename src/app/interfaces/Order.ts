import { Coordinates } from './Coordinates';
import { Location } from './Location';
import { Promocode } from './Promocode';
import { TimeCreated } from './TimeCreated';

export interface Order  {
  id?: string;
  timeCreated?: TimeCreated;
  destination?: {
      address: string[];
      coordinates: Coordinates;
  };
  extras?: string[];
  status?: number;
  totalPrice?: number;
  paymentMethod?: string;
  customer?: string;
  
  uid?: string;
  products?: OrderProduct[];
  promocodeUsed?: Promocode;
  paymentMethodId?: string;
  deliveryInstructions?: string;
  restaurantInstructions?: string;
  location?: Location;
  branchId?: string;
  index?: number;
}

export interface OrderProduct {
  index?: number;
  quantity?: number;
  extras?: string[];
  sides?: string[];
  name?: string;
  id?: string;
  price?: number;
  mainProduct?: string;
  isSide?: boolean;
  extrasAmount?: number;
  selectedOptions: any;
}