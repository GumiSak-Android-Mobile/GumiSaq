// app/(admin)/manage-designs/_components/ManageFonts.tsx

import {
  createDesignFont, // Anda perlu membuat fungsi ini di appwrite.ts
  deleteDesignFont, // Anda perlu membuat fungsi ini di appwrite.ts
  getDesignFonts,
  DesignFont,
} from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ManageFonts = () => {
  // PENTING: getDesignFonts harus ada di appwrite.ts, jika belum, buatlah seperti getDesignStickers
  const {
    data: fonts,
    loading,
    refetch,
  } = useAppwrite({ fn: getDesignFonts });
  const [newFontAsset, setNewFontAsset] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fungsi untuk memilih file font dari penyimpanan perangkat
  const handlePickFont = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["font/ttf", "font/opentype", "application/x-font-truetype"], // MIME types for .ttf and .otf
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setNewFontAsset(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memilih file font.");
    }
  };

  // Fungsi untuk mengunggah font yang telah dipilih
  const handleUploadFont = async () => {
    if (!newFontAsset) {
      Alert.alert("Error", "Pilih file font (.ttf atau .otf) terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    try {
      const file = {
        uri: newFontAsset.uri,
        name: newFontAsset.name,
        type: newFontAsset.mimeType || "application/octet-stream",
        size: newFontAsset.size || 0,
      };

      // Pastikan fungsi createDesignFont sudah dibuat di appwrite.ts
      await createDesignFont(file);
      Alert.alert("Sukses", "Font baru berhasil ditambahkan.");
      setNewFontAsset(null);
      refetch();
    } catch (error: any) {
      Alert.alert("Error", `Gagal mengunggah font: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Fungsi untuk menghapus font
  const handleDelete = (item: DesignFont) => {
    Alert.alert("Hapus Font", `Yakin ingin menghapus font "${item.name}"?`, [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            // Pastikan fungsi deleteDesignFont sudah dibuat di appwrite.ts
            await deleteDesignFont(item.$id, item.fontFileUrl);
            Alert.alert("Sukses", "Font berhasil dihapus.");
            refetch();
          } catch (error) {
            Alert.alert("Error", "Gagal menghapus font.");
          }
        },
      },
    ]);
  };

  return (
    <View className="p-4">
      {/* Bagian Tambah Font */}
      <Text className="text-lg font-bold mb-3">Tambah Font Baru</Text>
      <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <TouchableOpacity
          onPress={handlePickFont}
          className="border-2 border-dashed border-gray-300 w-full p-4 rounded-lg justify-center items-center bg-gray-50"
        >
          <Ionicons name="text-outline" size={40} color="gray" />
          <Text className="text-gray-600 mt-2 text-center" numberOfLines={2}>
            {newFontAsset
              ? newFontAsset.name
              : "Ketuk untuk Pilih File Font (.ttf / .otf)"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUploadFont}
          disabled={!newFontAsset || isUploading}
          className={`mt-4 p-3 rounded-lg items-center ${
            !newFontAsset || isUploading ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          {isUploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Unggah Font</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Daftar Font */}
      <Text className="text-lg font-bold mt-6 mb-2">Daftar Font</Text>
      {loading && !fonts ? (
        <ActivityIndicator size="large" className="mt-4" />
      ) : (
        <FlatList
          data={fonts}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-lg mb-2 flex-row items-center justify-between shadow-sm">
              <Ionicons name="text" size={24} color="#333" className="mr-4" />
              <Text className="flex-1 font-semibold text-gray-800" numberOfLines={1}>
                {item.name}
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
                <Text className="text-gray-500">Belum ada font.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default ManageFonts;