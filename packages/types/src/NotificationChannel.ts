export interface NotificationChannel {
  id: string;
  type: string;
  topic: string | string[];
  receiveFrom: string;
  sendTo?: string;
  sender?: string;
}
