export interface Driver {
    id: string;
    name: string;
    loginPassword?: string;
    orders: string;
    deliveredOrderIds: string[];
}