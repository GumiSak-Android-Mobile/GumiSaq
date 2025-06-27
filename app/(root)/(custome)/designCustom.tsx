import ShirtCanvas from '@/components/ShirtCanvas';
import StickerPicker from '@/components/StickerPicker';
import React, { useState } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';

type StickerType = number | { uri: string };

export default function DesignScreen() {
  const [stickers, setStickers] = useState<StickerType[]>([]);
  const router = useRouter();

  const addSticker = (sticker: StickerType) => {
    setStickers([...stickers, sticker]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white">
        
        {/* Header dengan tombol Back */}
        <View className="bg-[#4F6D55] py-4 px-5 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeftIcon size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Template</Text>
        </View>

        {/* Area Kanvas */}
        <View className="flex-1 items-center justify-center">
          <ShirtCanvas stickers={stickers} />
        </View>

        {/* Picker Stiker */}
        <StickerPicker onSelect={addSticker} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
