export interface Driver {
  username: string;
  name: string;
  balance: number;
  loginPassword?: string;
  orders: string;
  deliveredOrderIds: string[];
}
