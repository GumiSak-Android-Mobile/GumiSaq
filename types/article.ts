// gumisak-android-mobile/gumisaq/GumiSaq-admin/types/article.ts

import { Models } from "react-native-appwrite";

/**
 * Interface yang merepresentasikan struktur data dari sebuah dokumen artikel
 * yang diambil dari database Appwrite, disesuaikan dengan kebutuhan aplikasi user.
 */
export interface Article extends Models.Document {
  title: string;
  description: string;
  description2?: string;
  description3?: string;
  image: string;
  image2?: string;
  image3?: string;
  content: string;
  category: 'Hiburan' | 'Benda' | 'Tradisi' | 'Adat';
  author: string;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  created?: string;
}

/**
 * Interface untuk data yang dibutuhkan saat membuat atau mengedit artikel.
 * Digunakan dalam form di aplikasi admin.
 */
export interface CreateArticleData {
  title: string;
  description: string;
  description2?: string;
  description3?: string;
  image: string;
  image2?: string;
  image3?: string;
  content: string;
  category: Article['category'];
  author: string;
  tags: string[];
  isPublished: boolean;
  imageFile?: any; // Opsional: untuk menampung data file dari image picker utama
  imageFile2?: any; // Opsional: untuk gambar kedua
  imageFile3?: any; // Opsional: untuk gambar ketiga
}