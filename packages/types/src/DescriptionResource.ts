import { NotificationChannel } from "./NotificationChannel";
import { SubscriptionService } from "./SubscriptionService";

export interface DescriptionResource {
  "@context": string | string[];
  id: string;
  subscription: SubscriptionService[];
  channel: NotificationChannel[];
}
