export interface ToastMessage {
    message: string;
    button?: {
        text: string;
        handler: () => void;
    };
    timeout: number;
}