// app/(admin)/manage-designs/_components/ManageStickers.tsx

import {
  createDesignSticker,
  deleteDesignSticker,
  getDesignStickers,
  DesignSticker,
} from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ManageStickers = () => {
  const {
    data: stickers,
    loading,
    refetch,
  } = useAppwrite({ fn: getDesignStickers });
  const [newStickerAsset, setNewStickerAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fungsi untuk memilih gambar stiker dari galeri
  const handlePickSticker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Izin Diperlukan", "Izin akses galeri dibutuhkan.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1, // Kualitas terbaik untuk stiker
    });

    if (!result.canceled) {
      setNewStickerAsset(result.assets[0]);
    }
  };

  // Fungsi untuk mengunggah stiker yang telah dipilih
  const handleUploadSticker = async () => {
    if (!newStickerAsset) {
      Alert.alert("Error", "Pilih file gambar untuk stiker terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    try {
      const file = {
        uri: newStickerAsset.uri,
        name: newStickerAsset.fileName || `sticker-${Date.now()}.png`,
        type: newStickerAsset.mimeType || "image/png",
        size: newStickerAsset.fileSize || 0,
      };

      await createDesignSticker(file);
      Alert.alert("Sukses", "Stiker baru berhasil ditambahkan.");
      setNewStickerAsset(null); // Reset pilihan
      refetch(); // Muat ulang daftar stiker
    } catch (error: any) {
      Alert.alert("Error", `Gagal mengunggah stiker: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Fungsi untuk menghapus stiker
  const handleDelete = (item: DesignSticker) => {
    Alert.alert(
      "Hapus Stiker",
      `Apakah Anda yakin ingin menghapus stiker ini?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDesignSticker(item.$id, item.imageFileId);
              Alert.alert("Sukses", "Stiker berhasil dihapus.");
              refetch();
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus stiker.");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="p-4">
      {/* Bagian Tambah Stiker */}
      <Text className="text-lg font-bold mb-3">Tambah Stiker Baru</Text>
      <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <TouchableOpacity
          onPress={handlePickSticker}
          className="border-2 border-dashed border-gray-300 w-full h-40 rounded-lg justify-center items-center bg-gray-50"
        >
          {newStickerAsset ? (
            <Image
              source={{ uri: newStickerAsset.uri }}
              className="w-full h-full rounded-lg"
              resizeMode="contain"
            />
          ) : (
            <View className="items-center">
              <Ionicons name="image-outline" size={40} color="gray" />
              <Text className="text-gray-500 mt-2">Ketuk untuk Pilih Gambar</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUploadSticker}
          disabled={!newStickerAsset || isUploading}
          className={`mt-4 p-3 rounded-lg items-center ${
            !newStickerAsset || isUploading ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          {isUploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Unggah Stiker</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Daftar Stiker */}
      <Text className="text-lg font-bold mt-6 mb-2">Daftar Stiker</Text>
      {loading && !stickers ? (
         <ActivityIndicator size="large" className="mt-4" />
      ) : (
        <FlatList
          data={stickers}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View className="bg-white p-3 rounded-lg mb-2 flex-row items-center justify-between shadow-sm">
              <Image
                source={{ uri: item.imageFileId }}
                className="w-16 h-16 rounded bg-gray-100"
                resizeMode="contain"
              />
              <Text className="flex-1 ml-4 text-gray-700" numberOfLines={1}>
                ID: {item.$id}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="items-center justify-center p-8 bg-white rounded-lg">
                <Text className="text-gray-500">Belum ada stiker.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default ManageStickers;