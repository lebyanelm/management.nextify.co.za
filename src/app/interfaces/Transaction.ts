import { Promocode } from './Promocode';
import { TimeCreated } from './TimeCreated';
export interface Transaction {
    id: string;
    branchId: string | null;
    orderId: string | 'Not Acceptable';
    customerId: string | 'Not Acceptable';
    amountIn: string;
    amountOut: string;
    balance: number;
    orderAmount: number;
    reference: number;
    timeCreated: TimeCreated;
    type: 'Online' | 'Cash' | 'Withdrawal';
    transactionType: 'Order' | 'Withdrawal';
    usedPromocode: Promocode;
    xid: string;
    cavv: string;
}