// app/(admin)/manage-scanner/[id].tsx

import { getScannerVideoById, updateScannerVideoTitle } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const EditScannerVideoScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const videoData = await getScannerVideoById(id);
        if (videoData) {
          setTitle(videoData.title);
        }
      } catch (error) {
        Alert.alert("Error", "Gagal memuat data video.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideoData();
  }, [id]);

  const handleUpdate = async () => {
    if (!title) {
      Alert.alert("Input Tidak Lengkap", "Judul tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateScannerVideoTitle(id!, title);
      Alert.alert("Sukses!", "Judul video berhasil diperbarui.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert("Error", `Gagal memperbarui: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2"><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Edit Judul Video</Text>
        <TouchableOpacity onPress={handleUpdate} disabled={isSubmitting} className="p-2">
          {isSubmitting ? <ActivityIndicator color="#0BBEBB" /> : <Ionicons name="checkmark-done" size={28} color="#0BBEBB" />}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" className="mt-16" />
      ) : (
        <View className="p-5">
            <Text className="text-base text-gray-600 mb-2">Judul Video</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Masukkan judul baru..."
              className="border border-gray-300 p-4 rounded-xl text-base"
            />
        </View>
      )}
    </SafeAreaView>
  );
};

export default EditScannerVideoScreen;
