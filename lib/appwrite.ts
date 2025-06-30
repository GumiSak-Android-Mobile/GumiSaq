// lib/appwrite.ts

import { Article } from "@/types/article";
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


  shirtColorsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COLORS_COLLECTION_ID,
  designStickersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_STICKERS_COLLECTION_ID,
  designFontsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FONTS_COLLECTION_ID,

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


export interface DesignSticker extends Models.Document {
  name: string;
  imageFileId: string; // Asumsi ini menyimpan URL langsung atau ID file
  order: number;
}

export interface ShirtColor extends Models.Document {
  name: string;
  hexCode: string;
  order: number;
}

export interface DesignFont extends Models.Document {
  name: string;
  fontFileUrl: string; // Asumsi ini menyimpan URL ke file font
  order: number;
}

// =================================================================
// LAYANAN MANAJEMEN ASET DESAIN
// =================================================================

// --- FUNGSI WARNA ---
export async function getShirtColors(): Promise<ShirtColor[]> {
  try {
    const response = await databases.listDocuments<ShirtColor>(
      config.databaseId!,
      config.shirtColorsCollectionId!,
      [Query.orderAsc("order")]
    );
    return response.documents;
  } catch (error) {
    throw new Error("Gagal mengambil data warna.");
  }
}

export async function createShirtColor(data: { name: string; hexCode: string; }): Promise<Models.Document> {
    return databases.createDocument(
      config.databaseId!,
      config.shirtColorsCollectionId!,
      ID.unique(),
      data
    );
}

export async function deleteShirtColor(documentId: string): Promise<void> {
    await databases.deleteDocument(config.databaseId!, config.shirtColorsCollectionId!, documentId);
}


// --- FUNGSI STIKER ---
export async function getDesignStickers(): Promise<DesignSticker[]> {
  try {
    const response = await databases.listDocuments<DesignSticker>(
      config.databaseId!,
      config.designStickersCollectionId!,
      [Query.orderAsc("order")]
    );
    return response.documents;
  } catch (error) {
    throw new Error("Gagal mengambil data stiker.");
  }
}

export async function createDesignSticker(file: any): Promise<Models.Document> {
  // 1. Upload file stiker ke storage
  const uploadedFile = await uploadFile(file, config.storageBucketId!);
  if (!uploadedFile?.$id) {
    throw new Error("Gagal unggah file stiker.");
  }

  // 2. Dapatkan URL preview file
  const fileUrl = getFilePreview(config.storageBucketId!, uploadedFile.$id, "view");

  // 3. Simpan URL ke database
  return databases.createDocument(
    config.databaseId!,
    config.designStickersCollectionId!,
    ID.unique(),
    {
      name: file.name, // atau nama lain yang diinginkan
      imageFileId: fileUrl.href, // Simpan URL lengkap
    }
  );
}

export async function deleteDesignSticker(documentId: string, fileUrl: string): Promise<void> {
  try {
    // Ekstrak fileId dari URL
    const urlParts = fileUrl.split('/');
    const fileId = urlParts[urlParts.length - 2];
    
    // Hapus dokumen dan file di storage
    await databases.deleteDocument(config.databaseId!, config.designStickersCollectionId!, documentId);
    await storage.deleteFile(config.storageBucketId!, fileId);
  } catch (error) {
      console.error("Gagal menghapus stiker:", error);
      throw error;
  }
}


// --- FUNGSI FONT ---
export async function getDesignFonts(): Promise<DesignFont[]> {
  try {
    const response = await databases.listDocuments<DesignFont>(
      config.databaseId!,
      config.designFontsCollectionId!,
      [Query.orderAsc("order")]
    );
    return response.documents;
  } catch (error) {
    console.error("Gagal mengambil data font:", error);
    throw new Error("Gagal mengambil data font.");
  }
}


export async function createDesignFont(file: any): Promise<Models.Document> {
  // 1. Upload file font ke storage
  const uploadedFile = await uploadFile(file, config.storageBucketId!);
  if (!uploadedFile?.$id) {
    throw new Error("Gagal unggah file font.");
  }

  // 2. Dapatkan URL preview file
  const fileUrl = getFilePreview(config.storageBucketId!, uploadedFile.$id, "view");

  // 3. Simpan URL ke database
  return databases.createDocument(
    config.databaseId!,
    config.designFontsCollectionId!,
    ID.unique(),
    {
      name: file.name.replace(/\.[^/.]+$/, ""), // Hapus ekstensi file dari nama
      fontFileUrl: fileUrl.href,
    }
  );
}

export async function deleteDesignFont(documentId: string, fileUrl: string): Promise<void> {
  try {
    // Ekstrak fileId dari URL untuk dihapus dari storage
    const urlParts = fileUrl.split('/');
    const fileId = urlParts[urlParts.length - 2];

    // Hapus dokumen dari database
    await databases.deleteDocument(config.databaseId!, config.designFontsCollectionId!, documentId);
    // Hapus file dari storage
    await storage.deleteFile(config.storageBucketId!, fileId);
  } catch (error) {
      console.error("Gagal menghapus font:", error);
      throw error;
  }
}