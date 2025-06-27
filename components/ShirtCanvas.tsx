import React from 'react';
import { Image, View } from 'react-native';
import DraggableSticker from './DragableSticker';

const shirt = require('@/assets/images/abu2.png');

export default function ShirtCanvas({ stickers, onUpdateSticker, selectedStickerId, onSelectSticker }: any) {
  return (
    <View className="relative w-[280px] h-[350px] mt-4">
      <Image source={shirt} className="w-full h-full" resizeMode="contain" />
      {stickers.map((sticker: any) => (
        <DraggableSticker
          key={sticker.id}
          {...sticker}
          isSelected={sticker.id === selectedStickerId}
          onUpdate={(updated: any) => onUpdateSticker(sticker.id, updated)}
          onSelect={() => onSelectSticker(sticker.id)}
        />
      ))}
    </View>
  );
}
