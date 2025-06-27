import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';

const stickerList = [
  require('@/assets/images/ijo.png'),
  require('@/assets/images/kuning.png'),
  require('@/assets/images/maroon.png'),
];

export default function StickerPicker({ onSelect }: any) {
  return (
    <View className="bg-gray-200 p-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {stickerList.map((sticker, index) => (
          <TouchableOpacity key={index} onPress={() => onSelect(sticker)} className="mx-2">
            <Image source={sticker} style={{ width: 50, height: 50 }} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
