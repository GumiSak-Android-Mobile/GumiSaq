import { Models } from 'react-native-appwrite';
import { Article } from './article';

// Jenis notifikasi sekarang hanya untuk artikel
export type NotificationType = 'article';

// Data tambahan yang relevan untuk notifikasi artikel
export interface NotificationData {
  articleId?: string;
  articleTitle?: string;
  articleData?: Article;
}

// Interface dasar untuk notifikasi
export interface Notification {
  $id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read?: boolean;
  data?: NotificationData;
}

// Parameter untuk mengambil notifikasi dari server
export interface NotificationParams {
  userId: string;
  page?: number;
  pageSize?: number;
}

// Properti untuk komponen item notifikasi di UI
export interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  onPress: () => void;
  onDelete: () => void;
  read?: boolean;
}

// Parameter untuk membuat entri notifikasi baru
export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  read?: boolean;
  data?: NotificationData;
}

// Tipe dokumen notifikasi yang diperluas dari Appwrite Models
export interface NotificationDocument extends Models.Document {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  data?: NotificationData;
}