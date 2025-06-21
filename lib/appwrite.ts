import { Article, CreateArticleData } from "@/types/article"; // Asumsi tipe ini ada
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
import { createArticleNotification } from "./notification-service"; // Asumsi file ini ada

// --- Definisi Tipe ---
export interface Admin extends Models.Document {
  name: string;
  email: string;
  // password tidak lagi disimpan di sini
  userType: "admin";
}

// --- Konfigurasi Appwrite (TETAP SAMA) ---
export const config = {
  platform: "",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  storageBucketId: process.env.EXPO_PUBLIC_APPWRITE_ARTICLES_BUCKET_ID || "articles",
  adminCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ADMIN_COLLECTION_ID,
  artikelCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ARTIKEL_COLLECTION_ID,
  usersProfileCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_PROFILE_COLLECTION_ID,
};

if (!config.adminCollectionId || !config.storageBucketId) {
  throw new Error("ID Koleksi Admin atau ID Bucket Penyimpanan belum diatur di environment variables.");
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
// LAYANAN OTENTIKASI ADMIN (DIPERBARUI)
// =================================================================

/**
 * Mendaftarkan admin baru.
 * Pendaftaran admin idealnya dilakukan melalui backend atau Appwrite Console untuk keamanan.
 * Fungsi ini disediakan untuk kelengkapan, namun disarankan untuk tidak diekspos di UI publik.
 */
export async function registerAdmin(name: string, email: string, password: string): Promise<Models.Document> {
  try {
    // 1. Buat akun di sistem otentikasi Appwrite
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Gagal membuat akun admin.");

    // 2. Simpan profil admin di koleksi database 'admin'
    return await databases.createDocument(
        config.databaseId!,
        config.adminCollectionId!,
        newAccount.$id,
        {
            name,
            email,
            userType: "admin",
            accountId: newAccount.$id
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
    // TAMBAHKAN BLOK INI: Coba hapus sesi yang mungkin sudah ada
    try {
      await account.deleteSession("current");
    } catch (e) {
      // Tidak apa-apa jika gagal, berarti memang tidak ada sesi aktif.
      // Kita bisa mengabaikan error ini.
      console.log("No active session found, proceeding to login.");
    }
    // AKHIR BLOK TAMBAHAN

    // 1. Buat sesi login baru
    await account.createEmailPasswordSession(email, password);
    
    // 2. Ambil data admin yang sudah login
    const adminData = await getCurrentAdmin();
    if (!adminData) throw new Error("Profil admin tidak ditemukan setelah login.");
    
    return adminData;
  } catch (error) {
    console.error("Login admin error:", error);
    throw error;
  }
}

/**
 * Mengambil data admin yang sedang login dari sesi aktif.
 */
export async function getCurrentAdmin(): Promise<Admin | null> {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    // Pastikan pengguna ini adalah admin dengan memeriksa koleksi admin
    const adminProfile = await databases.getDocument<Admin>(
        config.databaseId!,
        config.adminCollectionId!,
        currentAccount.$id
    );

    return adminProfile;
  } catch (error) {
    // Jika getDocument gagal, berarti user ini bukan admin di koleksi tersebut
    console.log("Sesi aktif bukan milik admin, atau profil tidak ditemukan.");
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
// LAYANAN PENYIMPANAN (STORAGE) - TIDAK ADA PERUBAHAN
// =================================================================

export async function uploadFile(file: any, bucketId: string): Promise<Models.File> {
  try {
      return await storage.createFile(bucketId, ID.unique(), file);
  } catch (error) {
      throw new Error(`Gagal mengunggah file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getFilePreview(bucketId: string, fileId: string): URL {
  return storage.getFileView(bucketId, fileId);
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
// LAYANAN MANAJEMEN KONTEN (ARTIKEL) - TIDAK ADA PERUBAHAN
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
        let finalImage = updateData.image;

        if (updateData.imageFile) {
            const oldArticle = await getArticleById(articleId);
            const uploadedFile = await uploadFile(updateData.imageFile, config.storageBucketId!);
            finalImage = getFilePreview(config.storageBucketId!, uploadedFile.$id).href;
            if (oldArticle.image) {
                await deleteFileByUrl(oldArticle.image);
            }
        }
        
        const { imageFile, ...payload } = { ...updateData, image: finalImage };

        await databases.updateDocument(
            config.databaseId!,
            config.artikelCollectionId!,
            articleId,
            payload
        );
    } catch (error) {
        console.error("Gagal memperbarui artikel:", error);
        throw error;
    }
}

export async function publishNewArticle(articleData: CreateArticleData): Promise<Models.Document> {
  try {
    const articlePayload = {
        title: articleData.title,
        description: articleData.description || "",
        content: articleData.content,
        category: articleData.category,
        author: articleData.author,
        tags: articleData.tags,
        isPublished: articleData.isPublished,
        image: articleData.image,
        viewCount: 0,
    };
    
    const newArticle = await databases.createDocument(
      config.databaseId!,
      config.artikelCollectionId!,
      ID.unique(),
      articlePayload
    );

    // Mengambil semua ID pengguna untuk dikirimkan notifikasi
    const allUserIds = await getAllUserIds();
    if (allUserIds.length > 0) {
      await createArticleNotification(
        newArticle.$id,
        newArticle.title,
        articleData.description || "Artikel baru telah terbit!",
        allUserIds
      );
    }
    return newArticle;
  } catch (error) {
    console.error("Gagal mempublikasikan artikel:", error);
    throw error;
  }
}

// =================================================================
// FUNGSI HELPER (INTERNAL) - TIDAK ADA PERUBAHAN
// =================================================================

async function getAllUserIds(): Promise<string[]> {
  try {
    const users = await databases.listDocuments(
        config.databaseId!, 
        config.usersProfileCollectionId!, 
        [Query.select(["$id"])]
    );
    return users.documents.map((doc) => doc.$id);
  } catch (error) {
    console.error("Error saat mengambil semua ID pengguna:", error);
    return [];
  }
}