// app/(admin)/manage-scanner/index.tsx

import { saveScannerVideo } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ManageScannerScreen = () => {
  const router = useRouter();
  const [video, setVideo] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null
  );
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setVideo(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih video.');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!video || !title) {
      Alert.alert('Input Tidak Lengkap', 'Judul dan file video wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Menyesuaikan payload agar sesuai dengan interface baru
      await saveScannerVideo({
        title,
        videoFile: {
          uri: video.uri,
          name: video.name,
          mimeType: video.mimeType || null,
          size: video.size,
        },
      });

      Alert.alert('Sukses', 'Video berhasil diunggah.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', `Gagal mengunggah: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between bg-white px-4 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">
          Unggah Video Scanner
        </Text>
      </View>

      <View className="p-4 space-y-6">
        <View>
          <Text className="text-base text-gray-600 mb-2">Judul Video</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Masukkan judul video..."
            className="border border-gray-300 p-4 rounded-xl text-base bg-white mb-2"
          />
        </View>

        <TouchableOpacity
          onPress={pickVideo}
          className="border border-dashed border-gray-400 p-4 rounded-xl items-center justify-center h-32 bg-gray-50"
        >
          {video ? (
            <View className="items-center">
              <Ionicons name="film-outline" size={40} color="green" />
              <Text className="text-gray-700 mt-2 font-semibold">
                {video.name}
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <Ionicons name="cloud-upload-outline" size={40} color="gray" />
              <Text className="text-gray-500 mt-2">Ketuk untuk Pilih Video</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`py-4 rounded-xl items-center mt-4 ${
            isSubmitting ? 'bg-gray-400' : 'bg-primary-500'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Unggah Video</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ManageScannerScreen;