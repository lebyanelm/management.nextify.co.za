import { TimeCreated } from './TimeCreated';
export interface Login {
    ipAddress: string;
    userAgent: string;
    deviceType: string;
    timeCreated: TimeCreated;
}
