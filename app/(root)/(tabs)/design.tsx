// app/(tabs)/design_feature.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { PencilIcon, PhotoIcon } from 'react-native-heroicons/outline';

export default function DesignFeatureScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#4F6D55" />

      {/* Header */}
      <View className="flex-row items-center p-4 bg-[#4F6D55]">
        {/* <TouchableOpacity className="mr-4">
          <View className="w-6 h-0.5 bg-white mb-1" />
          <View className="w-6 h-0.5 bg-white mb-1" />
          <View className="w-6 h-0.5 bg-white" />
        </TouchableOpacity> */}
        <Text className="text-white text-lg font-bold">GumisaQ Design Studio</Text>
      </View>

      {/* Area Konten */}
      <View className="flex-1 items-center justify-center p-4">
        <View className="flex-row justify-center mb-12">
          {/* Kartu Design */}
          <TouchableOpacity
            onPress={() => router.push('/designBaju')}
            className="bg-[#6B8E78] p-6 rounded-lg shadow-md mr-4 items-center w-40 h-40 justify-center"
          >
            <PencilIcon size={48} color="white" />
            <Text className="mt-2 text-white text-base font-semibold">DESIGN</Text>
          </TouchableOpacity>

          {/* Kartu Template */}
          <TouchableOpacity
            onPress={() => router.push('/DesignCustom')}
            className="bg-[#6B8E78] p-6 rounded-lg shadow-md items-center w-40 h-40 justify-center"
          >
            <PhotoIcon size={48} color="white" />
            <Text className="mt-2 text-white text-base font-semibold">TEMPLATE</Text>
          </TouchableOpacity>
        </View>

        {/* Teks Ajakan Bertindak */}
        <Text className="text-[#4F6D55] text-xl font-bold tracking-wide">
          DESIGN AND GET YOUR T-SHIRT
        </Text>
      </View>
    </SafeAreaView>
  );
}
