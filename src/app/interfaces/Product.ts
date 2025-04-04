import { Section } from './Section';
import { IonRangeValue } from './IonRangeValue';
import { TimeCreated } from './TimeCreated';
export interface Product {
  timeCreated?: TimeCreated;
  id?: string;
  uid?: string;
  name: string;
  description: string;
  inStock?: boolean;
  price: number | string;
  category: string;
  buys?: number;
  views?: number;
  extras: string[];
  sides: string[];
  isAccepted?: boolean;
  index?: number;
  images: any[];
  dietary?: string;
  branches: string[];
  expectedPrepareTime?: IonRangeValue;
  sellingHours?: IonRangeValue;
  noRequiredSides?: number;
  sections: Section[];
}
