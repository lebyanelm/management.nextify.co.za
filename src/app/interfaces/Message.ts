export interface Message {
    body: string;
    reply: { id: string; message: string, attachments: [] };
    from: string;
    to: string;
    attachments: string[];
    type: string;
    state: number;
}
