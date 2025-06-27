import React from 'react';
import { Image, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { DesignElement } from '@/constants/article';

interface Props {
  element: DesignElement;
}

export default function DraggableElement({ element }: Props) {
  const translateX = useSharedValue(element.x);
  const translateY = useSharedValue(element.y);
  const scale = useSharedValue(element.scale || 1);

  // nilai posisi awal
  const startX = useSharedValue(translateX.value);
  const startY = useSharedValue(translateY.value);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        {element.type === 'text' && element.text && (
          <Text style={{ color: element.textColor, fontSize: element.fontSize || 20, fontWeight: 'bold' }}>
            {element.text}
          </Text>
        )}
        {(element.type === 'image' || element.type === 'sticker') && element.imageUri && (
          <Image
            source={{ uri: element.imageUri }}
            style={{ width: 100, height: 100, resizeMode: 'contain' }}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
}
