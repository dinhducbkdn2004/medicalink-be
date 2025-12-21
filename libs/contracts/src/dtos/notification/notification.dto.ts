export interface NotificationDto {
  templateKey: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'WS';
  recipientId: string;
  recipientAs: 'PATIENT' | 'STAFF';
  payload: Record<string, any>;
}
