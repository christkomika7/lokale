export interface NotificationPayload {
  to: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface NotificationChannelAdapter {
  send(payload: NotificationPayload): Promise<void>;
}
