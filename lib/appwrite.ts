// lib/appwrite.ts

import { Article, CreateArticleData } from "@/types/article";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Models,
  Query,
  Storage,
} from "react-native-appwrite";

// --- Definisi Tipe ---
export interface Admin extends Models.Document {
  name: string;
  email: string;
  userType: "admin";
  accountId: string;
}

// Tipe untuk data video scanner
export interface ScannerVideo extends Models.Document {
  title: string;
  fileId: string;
}

// --- Konfigurasi Appwrite ---
export const config = {
  platform: "com.saqcloth.gumisaq",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  storageBucketId:
    process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || "default",
  adminCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ADMIN_COLLECTION_ID,
  artikelCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_ARTIKEL_COLLECTION_ID,
  collectionId: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID,
  scannerCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SCANNER_COLLECTION_ID,
};

// Validasi Konfigurasi
if (!config.adminCollectionId) {
  throw new Error("ID Koleksi Admin belum diatur di environment variables.");
}
if (!config.artikelCollectionId) {
  throw new Error("ID Koleksi Artikel belum diatur di environment variables.");
}
if (!config.scannerCollectionId) {
  throw new Error("ID Koleksi Scanner belum diatur di environment variables.");
}

// Inisialisasi Klien Appwrite
export const client = new Client()
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export const avatars = new Avatars(client);

// =================================================================
// LAYANAN OTENTIKASI ADMIN
// =================================================================

export async function registerAdmin(
  name: string,
  email: string,
  password: string
): Promise<Models.Document> {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Gagal membuat akun admin.");

    return await databases.createDocument(
      config.databaseId!,
      config.adminCollectionId!,
      newAccount.$id,
      {
        name,
        email,
        userType: "admin",
        accountId: newAccount.$id,
      }
    );
  } catch (error) {
    console.error("Gagal mendaftarkan admin:", error);
    throw error;
  }
}

export async function signInAdmin(
  email: string,
  password: string
): Promise<Admin> {
  try {
    await account.deleteSession("current").catch(() => {});
    await account.createEmailPasswordSession(email, password);
    const adminData = await getCurrentUser();
    if (!adminData) {
      await logout();
      throw new Error("Akun ini tidak memiliki hak akses sebagai admin.");
    }
    return adminData;
  } catch (error: any) {
    throw new Error(error.message || "Kredensial tidak valid.");
  }
}

export async function getCurrentUser(): Promise<Admin | null> {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    const adminProfile = await databases.getDocument<Admin>(
      config.databaseId!,
      config.adminCollectionId!,
      currentAccount.$id
    );
    return adminProfile;
  } catch (error) {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Gagal logout:", error);
  }
}

// =================================================================
// LAYANAN PENYIMPANAN (STORAGE)
// =================================================================

export async function uploadFile(
  file: any,
  bucketId: string
): Promise<Models.File> {
  try {
    return await storage.createFile(bucketId, ID.unique(), file);
  } catch (error) {
    throw new Error(
      `Gagal mengunggah file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function getFilePreview(
  bucketId: string,
  fileId: string,
  type: "view" | "download" = "view"
): URL {
  try {
    if (!config.endpoint || !config.projectId) {
      throw new Error(
        "Konfigurasi endpoint atau projectId Appwrite tidak ditemukan."
      );
    }
    const urlString = `${config.endpoint}/storage/buckets/${bucketId}/files/${fileId}/${type}?project=${config.projectId}`;
    return new URL(urlString);
  } catch (error) {
    console.error("Gagal membuat URL preview file:", error);
    throw new Error("Gagal membuat URL preview yang valid.");
  }
}

async function deleteFileById(fileId: string) {
  try {
    await storage.deleteFile(config.storageBucketId!, fileId);
    console.log(`File dengan ID ${fileId} berhasil dihapus.`);
  } catch (error) {
    console.warn(`Gagal menghapus file lama dari storage: ${error}`);
  }
}

// =================================================================
// LAYANAN MANAJEMEN KONTEN (ARTIKEL)
// =================================================================

export async function getArticles(): Promise<Article[]> {
  try {
    const response = await databases.listDocuments<Article>(
      config.databaseId!,
      config.artikelCollectionId!,
      [Query.orderDesc("$createdAt")]
    );
    return response.documents;
  } catch (error) {
    console.error("Gagal mengambil artikel:", error);
    throw error;
  }
}

// ... (fungsi-fungsi lain untuk artikel seperti getArticleById, deleteArticle, updateArticle, publishNewArticle)

// =================================================================
// LAYANAN MANAJEMEN VIDEO SCANNER
// =================================================================

interface ScannerVideoData {
  title: string;
  videoFile: {
    uri: string;
    name: string;
    mimeType: string | null;
    size?: number;
  };
}

export async function getScannerVideos(): Promise<ScannerVideo[]> {
  try {
    const response = await databases.listDocuments<ScannerVideo>(
      config.databaseId!,
      config.scannerCollectionId!,
      [Query.orderDesc("$createdAt")]
    );
    return response.documents;
  } catch (error) {
    console.error("Gagal mengambil video scanner:", error);
    throw new Error("Gagal mengambil daftar video.");
  }
}

export async function getScannerVideoById(id: string): Promise<ScannerVideo> {
  try {
    const response = await databases.getDocument<ScannerVideo>(
      config.databaseId!,
      config.scannerCollectionId!,
      id
    );
    return response;
  } catch (error) {
    console.error(`Gagal mengambil video dengan ID: ${id}`, error);
    throw new Error("Gagal mengambil data video.");
  }
}

export async function saveScannerVideo(
  data: ScannerVideoData
): Promise<Models.Document> {
  try {
    const fileToUpload = {
      uri: data.videoFile.uri,
      name: data.videoFile.name,
      type: data.videoFile.mimeType || "video/mp4",
      size: data.videoFile.size || 0,
    };

    const uploadedFile = await uploadFile(
      fileToUpload,
      config.storageBucketId!
    );
    if (!uploadedFile?.$id) {
      throw new Error("Gagal mendapatkan ID file setelah unggah.");
    }

    const scannerDocument = await databases.createDocument(
      config.databaseId!,
      config.scannerCollectionId!,
      ID.unique(),
      {
        title: data.title,
        fileId: uploadedFile.$id,
      }
    );

    return scannerDocument;
  } catch (error) {
    console.error("Gagal menyimpan video scanner:", error);
    throw new Error("Gagal menyimpan data video.");
  }
}

export async function updateScannerVideoTitle(
  id: string,
  title: string
): Promise<Models.Document> {
  try {
    return await databases.updateDocument(
      config.databaseId!,
      config.scannerCollectionId!,
      id,
      { title }
    );
  } catch (error) {
    console.error(`Gagal memperbarui judul video: ${id}`, error);
    throw new Error("Gagal memperbarui judul.");
  }
}

export async function deleteScannerVideo(
  documentId: string,
  fileId: string
): Promise<void> {
  try {
    await databases.deleteDocument(
      config.databaseId!,
      config.scannerCollectionId!,
      documentId
    );
    await deleteFileById(fileId);
  } catch (error) {
    console.error(`Gagal menghapus video: ${documentId}`, error);
    throw new Error("Gagal menghapus video.");
  }
}