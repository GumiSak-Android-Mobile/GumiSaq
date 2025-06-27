// app/(admin)/manage-scanner/index.tsx

import { deleteScannerVideo, getScannerVideos, ScannerVideo } from '@/lib/appwrite';
import { useAppwrite } from '@/lib/useAppwrite';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Komponen untuk setiap item dalam daftar video
const VideoListItem = ({ item, onEdit, onDelete }: { item: ScannerVideo; onEdit: () => void; onDelete: () => void; }) => (
  <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex-row items-center justify-between">
    <View className="flex-row items-center flex-1">
      <Ionicons name="film-outline" size={32} color="#4A5568" />
      <View className="flex-1 ml-4">
        <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>{item.title}</Text>
        <Text className="text-xs text-gray-500 mt-1">ID File: {item.fileId}</Text>
      </View>
    </View>
    <View className="flex-row items-center">
      <TouchableOpacity onPress={onEdit} className="mr-4 bg-blue-100 p-2 rounded-full">
        <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} className="bg-red-100 p-2 rounded-full">
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  </View>
);

const ManageScannerScreen = () => {
  const router = useRouter();
  const { data: videos, loading, refetch } = useAppwrite({ fn: getScannerVideos });

  const handleDelete = (video: ScannerVideo) => {
    Alert.alert(
      "Hapus Video",
      `Apakah Anda yakin ingin menghapus video "${video.title}"?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          onPress: async () => {
            try {
              await deleteScannerVideo(video.$id, video.fileId);
              Alert.alert("Sukses", "Video telah dihapus.");
              refetch();
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus video.");
            }
          },
          style: "destructive" 
        },
      ]
    );
  };

  const handleEdit = (id: string) => {
    router.push(`./manage-scanner/${id}`);
  };
  
  const handleCreate = () => {
    router.push('./manage-scanner/create');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between bg-white px-4 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Manajemen Scanner</Text>
        <TouchableOpacity
          onPress={handleCreate}
          className="bg-primary-500 py-2 px-4 rounded-full flex-row items-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Tambah Video</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0BBEBB" />
          <Text className="mt-2 text-gray-600">Memuat video...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <VideoListItem 
              item={item} 
              onEdit={() => handleEdit(item.$id)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mt-20">
              <Ionicons name="videocam-off-outline" size={48} color="gray" />
              <Text className="text-gray-500 mt-4 text-lg">Belum ada video.</Text>
            </View>
          )}
          onRefresh={refetch}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
};

export default ManageScannerScreen;
