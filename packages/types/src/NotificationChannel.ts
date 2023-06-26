export enum ChannelType {
  WebhookChannel2023 = 'http://www.w3.org/ns/solid/notifications#WebhookChannel2023',
  WebSocketChannel2023 = 'http://www.w3.org/ns/solid/notifications#WebSocketChannel2023',
}

export interface NotificationChannel {
  id: string;
  type: ChannelType; // TODO channel types should be extendible
  topic: string | string[];
  receiveFrom?: string;
  sendTo?: string;
  sender?: string;
}
