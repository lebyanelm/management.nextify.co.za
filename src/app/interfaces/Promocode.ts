import { TimeCreated } from './TimeCreated';

export interface Promocode {
    id: string;
    timeCreated: TimeCreated;
    discount: string;
    usage: number;
    code: string;
    ends: string;
}
