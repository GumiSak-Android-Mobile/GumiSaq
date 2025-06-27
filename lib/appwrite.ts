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

// --- Konfigurasi Appwrite ---
export const config = {
  platform: "com.saqcloth.gumisaq",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  storageBucketId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || 'default',
  adminCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ADMIN_COLLECTION_ID,
  artikelCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ARTIKEL_COLLECTION_ID,
  scannerCollectionId:process.env.EXPO_PUBLIC_APPWRITE_SCANNER_COLLECTION_ID,
};

// Validasi Konfigurasi
if (!config.adminCollectionId) {
  throw new Error("ID Koleksi Admin belum diatur di environment variables.");
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
/**
 * PENTING: Pendaftaran admin sebaiknya dilakukan dari Appwrite Console untuk keamanan.
 * Fungsi ini disediakan untuk development, jangan diekspos di UI publik.
 */
export async function registerAdmin(name: string, email: string, password: string): Promise<Models.Document> {
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

/**
 * Login admin menggunakan sesi aman Appwrite.
 */
export async function signInAdmin(email: string, password: string): Promise<Admin> {
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

/**
 * Mengambil data admin yang sedang login dari sesi aktif.
 */
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

/**
 * Logout admin dengan menghapus sesi saat ini.
 */
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

export async function uploadFile(file: any, bucketId: string): Promise<Models.File> {
  try {
      return await storage.createFile(bucketId, ID.unique(), file);
  } catch (error) {
      throw new Error(`Gagal mengunggah file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getFilePreview(bucketId: string, fileId: string): URL {
  // WORKAROUND: Karena storage.getFileView() mengembalikan undefined,
  // kita akan membuat URL secara manual. Ini adalah metode yang lebih andal.
  try {
    if (!config.endpoint || !config.projectId) {
      throw new Error(
        "Konfigurasi endpoint atau projectId Appwrite tidak ditemukan."
      );
    }
    const urlString = `${config.endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${config.projectId}`;
    return new URL(urlString);
  } catch (error) {
    console.error("Gagal membuat URL preview file:", error);
    throw new Error("Gagal membuat URL preview yang valid.");
  }
}

async function deleteFileByUrl(fileUrl: string) {
  try {
      const fileId = fileUrl.split("/files/")[1].split("/view")[0];
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
    const response = await databases.listDocuments<Article>(config.databaseId!, config.artikelCollectionId!, [Query.orderDesc("$createdAt")]);
    return response.documents;
  } catch (error) {
    console.error("Gagal mengambil artikel:", error);
    throw error;
  }
}

export async function getArticleById(articleId: string): Promise<Article> {
  try {
    return await databases.getDocument<Article>(config.databaseId!, config.artikelCollectionId!, articleId);
  } catch (error) {
    console.error(`Gagal mengambil artikel dengan ID: ${articleId}`, error);
    throw error;
  }
}

export async function deleteArticle(articleId: string, image: string) {
  try {
    await databases.deleteDocument(config.databaseId!, config.artikelCollectionId!, articleId);
    if (image) {
      await deleteFileByUrl(image);
    }
  } catch (error) {
    console.error("Gagal menghapus artikel:", error);
    throw error;
  }
}

export async function updateArticle(articleId: string, updateData: Partial<CreateArticleData>) {
  try {
    const { imageFile, imageFile2, imageFile3, ...payload } = updateData;
    const updatePayload: { [key: string]: any } = { ...payload };

    // Ambil data artikel lama sekali saja jika ada gambar yang perlu diunggah
    const oldArticle = (imageFile || imageFile2 || imageFile3) 
      ? await getArticleById(articleId) 
      : null;

    // Proses unggah gambar utama
    if (imageFile && oldArticle) {
      const uploadedFile = await uploadFile(imageFile, config.storageBucketId!);
      updatePayload.image = getFilePreview(config.storageBucketId!, uploadedFile.$id).href;
      if (oldArticle.image) {
        await deleteFileByUrl(oldArticle.image);
      }
    }

    // Proses unggah gambar kedua
    if (imageFile2 && oldArticle) {
      const uploadedFile = await uploadFile(imageFile2, config.storageBucketId!);
      updatePayload.image2 = getFilePreview(config.storageBucketId!, uploadedFile.$id).href;
      if (oldArticle.image2) {
        await deleteFileByUrl(oldArticle.image2);
      }
    }
    
    // Proses unggah gambar ketiga
    if (imageFile3 && oldArticle) {
      const uploadedFile = await uploadFile(imageFile3, config.storageBucketId!);
      updatePayload.image3 = getFilePreview(config.storageBucketId!, uploadedFile.$id).href;
      if (oldArticle.image3) {
        await deleteFileByUrl(oldArticle.image3);
      }
    }

    await databases.updateDocument(
      config.databaseId!,
      config.artikelCollectionId!,
      articleId,
      updatePayload
    );
  } catch (error) {
    console.error("Gagal memperbarui artikel:", error);
    throw error;
  }
}

export async function publishNewArticle(articleData: CreateArticleData): Promise<Models.Document> {
  try {
    // Memastikan semua field dari CreateArticleData disertakan
    const articlePayload = {
      title: articleData.title,
      description: articleData.description || "",
      description2: articleData.description2 || "",
      description3: articleData.description3 || "",
      content: articleData.content,
      category: articleData.category,
      author: articleData.author,
      tags: articleData.tags,
      isPublished: articleData.isPublished,
      image: articleData.image,
      image2: articleData.image2 || null,
      image3: articleData.image3 || null,
      viewCount: 0,
      created: new Date().toISOString(), // Menambahkan tanggal pembuatan
    };
    
    const newArticle = await databases.createDocument(
      config.databaseId!,
      config.artikelCollectionId!,
      ID.unique(),
      articlePayload
    );
    
    return newArticle;
  } catch (error) {
    console.error("Gagal mempublikasikan artikel:", error);
    throw error;
  }
}

// =================================================================
// LAYANAN SCANNER
// =================================================================

interface ScannerVideoData {
  title: string;
  videoFile: {
    uri: string;
    name: string;
    mimeType: string | null; // Mengganti 'type' menjadi 'mimeType' dan mengizinkan null
    size?: number; // Jadikan size opsional
  };
}

export async function saveScannerVideo(
  data: ScannerVideoData
): Promise<Models.Document> {
  try {
    // 1. Unggah file video ke storage
    const fileToUpload = {
      uri: data.videoFile.uri,
      name: data.videoFile.name,
      type: data.videoFile.mimeType || 'video/mp4', // Fallback ke 'video/mp4' jika null
      size: data.videoFile.size || 0,
    };
    
    const uploadedFile = await uploadFile(
      fileToUpload,
      config.storageBucketId!
    );
    if (!uploadedFile?.$id) {
      throw new Error('Gagal mendapatkan ID file setelah unggah.');
    }

    // 2. Simpan data ke koleksi 'scanner'
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
    console.error('Gagal menyimpan video scanner:', error);
    throw new Error('Gagal menyimpan data video.');
  }
}