// app/(admin)/manage-designs/_components/ManageColors.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppwrite } from '@/lib/useAppwrite';
import { getShirtColors, createShirtColor, deleteShirtColor, ShirtColor } from '@/lib/appwrite';

const ManageColors = () => {
  const { data: colors, loading, refetch } = useAppwrite({ fn: getShirtColors });
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddColor = async () => {
    if (!name || !hexCode) {
      Alert.alert("Error", "Nama dan kode hex tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createShirtColor({ name, hexCode });
      Alert.alert("Sukses", "Warna berhasil ditambahkan.");
      setName('');
      setHexCode('');
      refetch();
    } catch (error) {
      Alert.alert("Error", "Gagal menambah warna.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item: ShirtColor) => {
    Alert.alert("Hapus Warna", `Yakin ingin menghapus warna "${item.name}"?`, [
      { text: "Batal" },
      { text: "Hapus", onPress: async () => {
          try {
            await deleteShirtColor(item.$id);
            Alert.alert("Sukses", "Warna dihapus.");
            refetch();
          } catch {
            Alert.alert("Error", "Gagal menghapus warna.");
          }
      }}
    ]);
  };

  // Komponen Header untuk FlatList
  const ListHeader = () => (
    <View className="p-4 mb-4">
      <Text className="text-lg font-bold mb-2">Tambah Warna Baru</Text>
      <TextInput placeholder="Nama Warna (e.g., Merah)" value={name} onChangeText={setName} className="bg-white p-3 rounded-lg border border-gray-300 mb-2" />
      <TextInput placeholder="Kode Hex (e.g., #FF0000)" value={hexCode} onChangeText={setHexCode} className="bg-white p-3 rounded-lg border border-gray-300 mb-3" />
      <TouchableOpacity onPress={handleAddColor} disabled={isSubmitting} className={`p-3 rounded-lg items-center ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'}`}>
        {isSubmitting ? <ActivityIndicator color="white"/> : <Text className="text-white font-bold">Tambah Warna</Text>}
      </TouchableOpacity>
      <Text className="text-lg font-bold mt-6 mb-2">Daftar Warna</Text>
    </View>
  );

  return (
    <FlatList
      data={colors}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <View className="bg-white p-3 rounded-lg mb-2 flex-row items-center justify-between mx-4">
          <View className="flex-row items-center">
            <View style={{ backgroundColor: item.hexCode }} className="w-8 h-8 rounded-full mr-3 border border-gray-200" />
            <Text className="font-semibold">{item.name}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} className="p-2">
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
      )}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={() => (
        !loading && (
          <View className="items-center justify-center p-8 bg-white rounded-lg mx-4">
            <Text className="text-gray-500">Belum ada warna.</Text>
          </View>
        )
      )}
      onRefresh={refetch}
      refreshing={loading}
    />
  );
};

export default ManageColors;