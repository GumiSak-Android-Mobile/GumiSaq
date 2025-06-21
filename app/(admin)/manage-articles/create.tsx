// app/(admin)/manage-articles/create.tsx

import {
  config,
  getFilePreview,
  publishNewArticle,
  uploadFile,
} from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { CreateArticleData } from "@/types/article";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ArticleCategory = CreateArticleData["category"];

const CreateArticleScreen = () => {
  const router = useRouter();
  const { admin } = useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk setiap aset gambar
  const [imageAsset, setImageAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageAsset2, setImageAsset2] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageAsset3, setImageAsset3] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  // State untuk data form
  const [form, setForm] = useState<
    Omit<CreateArticleData, "author" | "tags" | "image" | "image2" | "image3"> & {
      tags: string;
    }
  >({
    title: "",
    description: "",
    description2: "",
    description3: "",
    content: "",
    category: "Hiburan",
    tags: "",
    isPublished: true,
  });

  const categories: ArticleCategory[] = ["Hiburan", "Benda", "Tradisi", "Adat"];

  // Fungsi untuk memilih gambar dari galeri
  const pickImage = async (
    setter: React.Dispatch<
      React.SetStateAction<ImagePicker.ImagePickerAsset | null>
    >
  ) => {
    // Meminta izin akses
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Izin Diperlukan", "Anda perlu memberikan izin akses galeri.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7, // Kompresi gambar untuk efisiensi
    });

    if (!result.canceled) {
      setter(result.assets[0]);
    }
  };

  // Fungsi utama untuk mempublikasikan artikel
  const handlePublish = async () => {
    // Validasi input dasar
    if (!form.title || !form.content) {
      Alert.alert("Input Tidak Lengkap", "Judul dan Konten wajib diisi.");
      return;
    }
    if (!imageAsset) {
      Alert.alert("Input Tidak Lengkap", "Gambar utama wajib dipilih.");
      return;
    }
    if (!admin) {
      Alert.alert("Error", "Sesi admin tidak ditemukan. Silakan login ulang.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Fungsi helper untuk mengunggah file dan mendapatkan URL dengan logging
      const uploadAndGetUrl = async (
        asset: ImagePicker.ImagePickerAsset | null,
        label: string
      ): Promise<string | null> => {
        if (!asset) return null;

        console.log(`--- DEBUG: Memulai proses unggah untuk: ${label} ---`);

        // PERBAIKAN: Membuat objek file lebih andal dengan nilai fallback
        const fileToUpload = {
          name: asset.fileName || `article_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg", // Fallback jika mimeType null
          uri: asset.uri,
          size: asset.fileSize || 0, // Fallback jika fileSize null
        };

        console.log(
          `[${label}] 1. Objek file yang akan diunggah:`,
          JSON.stringify(fileToUpload, null, 2)
        );

        try {
          const uploadedFile = await uploadFile(
            fileToUpload,
            config.storageBucketId!
          );

          console.log(
            `[${label}] 2. Respons dari fungsi uploadFile:`,
            JSON.stringify(uploadedFile, null, 2)
          );

          // Validasi ketat terhadap respons
          if (!uploadedFile || !uploadedFile.$id) {
            console.error(
              `[${label}] 3. ERROR: Respons unggah tidak valid atau tidak berisi .$id.`
            );
            throw new Error("Respons dari proses unggah tidak valid.");
          }

          console.log(
            `[${label}] 3. SUKSES: Mendapatkan ID file: ${uploadedFile.$id}`
          );

          const previewUrl = getFilePreview(
            config.storageBucketId!,
            uploadedFile.$id
          );
          console.log(
            `[${label}] 4. URL preview yang dihasilkan:`,
            previewUrl.href
          );
          console.log(`--- DEBUG: Proses unggah untuk ${label} selesai ---`);

          return previewUrl.href;
        } catch (e: any) {
          console.error(
            `[${label}] !!! TERJADI ERROR saat proses unggah:`,
            e.message
          );
          console.log(
            `--- DEBUG: Proses unggah untuk ${label} selesai dengan error ---`
          );
          // Mengembalikan null secara eksplisit jika ada error
          return null;
        }
      };

      // Memanggil helper dengan label untuk logging yang jelas
      const imageUrl = await uploadAndGetUrl(imageAsset, "Gambar Utama");
      if (!imageUrl) {
        throw new Error("Gagal memproses gambar utama setelah diunggah.");
      }

      const imageUrl2 = await uploadAndGetUrl(imageAsset2, "Gambar Kedua");
      const imageUrl3 = await uploadAndGetUrl(imageAsset3, "Gambar Ketiga");

      // Menyiapkan data untuk dikirim ke database
      const finalArticleData: CreateArticleData = {
        ...form,
        author: admin.name,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        image: imageUrl,
        image2: imageUrl2 || undefined,
        image3: imageUrl3 || undefined,
        isPublished: form.isPublished,
      };

      await publishNewArticle(finalArticleData);

      Alert.alert("Sukses!", "Artikel berhasil dipublikasikan.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", `Gagal mempublikasikan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Komponen UI untuk memilih gambar
  const ImagePickerBox = ({
    asset,
    onPick,
    title,
  }: {
    asset: ImagePicker.ImagePickerAsset | null;
    onPick: () => void;
    title: string;
  }) => (
    <View>
      <Text className="text-base text-gray-600 mb-2">{title}</Text>
      <TouchableOpacity
        onPress={onPick}
        className="border border-dashed border-gray-400 p-4 rounded-xl items-center justify-center h-48 bg-gray-50"
      >
        {asset ? (
          <Image
            source={{ uri: asset.uri }}
            className="w-full h-full rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center">
            <Ionicons name="cloud-upload-outline" size={40} color="gray" />
            <Text className="text-gray-500 mt-2">Ketuk untuk Pilih Gambar</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Artikel Baru</Text>
        <TouchableOpacity
          onPress={handlePublish}
          disabled={isSubmitting}
          className="p-2"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0BBEBB" />
          ) : (
            <Ionicons name="checkmark-done" size={28} color="#0BBEBB" />
          )}
        </TouchableOpacity>
      </View>

      {/* Konten Form */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="space-y-6">
          <ImagePickerBox
            asset={imageAsset}
            onPick={() => pickImage(setImageAsset)}
            title="Gambar Utama Artikel (Wajib)"
          />
          <ImagePickerBox
            asset={imageAsset2}
            onPick={() => pickImage(setImageAsset2)}
            title="Gambar Kedua (Opsional)"
          />
          <ImagePickerBox
            asset={imageAsset3}
            onPick={() => pickImage(setImageAsset3)}
            title="Gambar Ketiga (Opsional)"
          />

          <View>
            <Text className="text-base text-gray-600 mb-2">Judul Artikel</Text>
            <TextInput
              value={form.title}
              onChangeText={(e) => setForm({ ...form, title: e })}
              placeholder="Judul artikel..."
              className="border border-gray-300 p-4 rounded-xl text-base"
            />
          </View>

          <View>
            <Text className="text-base text-gray-600 mb-2">Deskripsi 1</Text>
            <TextInput
              value={form.description}
              onChangeText={(e) => setForm({ ...form, description: e })}
              multiline
              className="border border-gray-300 p-4 rounded-xl text-base h-24"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-base text-gray-600 mb-2">
              Deskripsi 2 (Opsional)
            </Text>
            <TextInput
              value={form.description2}
              onChangeText={(e) => setForm({ ...form, description2: e })}
              multiline
              className="border border-gray-300 p-4 rounded-xl text-base h-24"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-base text-gray-600 mb-2">
              Deskripsi 3 (Opsional)
            </Text>
            <TextInput
              value={form.description3}
              onChangeText={(e) => setForm({ ...form, description3: e })}
              multiline
              className="border border-gray-300 p-4 rounded-xl text-base h-24"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-base text-gray-600 mb-2">Konten</Text>
            <TextInput
              value={form.content}
              onChangeText={(e) => setForm({ ...form, content: e })}
              multiline
              className="border border-gray-300 p-4 rounded-xl text-base h-48"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-base text-gray-600 mb-2">Kategori</Text>
            <View className="border border-gray-300 rounded-xl">
              <Picker
                selectedValue={form.category}
                onValueChange={(val: ArticleCategory) =>
                  setForm({ ...form, category: val })
                }
                style={{ height: 56 }}
              >
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    value={cat}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-base text-gray-600 mb-2">
              Tags (pisahkan dengan koma)
            </Text>
            <TextInput
              value={form.tags}
              onChangeText={(e) => setForm({ ...form, tags: e })}
              className="border border-gray-300 p-4 rounded-xl text-base"
            />
          </View>
          
          <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
            <Text className="text-base text-gray-600">Publikasikan Artikel</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81d4fa" }}
              thumbColor={form.isPublished ? "#0BBEBB" : "#f4f3f4"}
              onValueChange={(val) => setForm({...form, isPublished: val})}
              value={form.isPublished}
            />
          </View>

          {/* Tombol Publikasikan */}
          <TouchableOpacity
            onPress={handlePublish}
            disabled={isSubmitting}
            className={`py-4 rounded-xl items-center mt-4 ${
              isSubmitting ? "bg-gray-400" : "bg-primary-500"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isSubmitting ? "Mempublikasikan..." : "Publikasikan"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateArticleScreen;
