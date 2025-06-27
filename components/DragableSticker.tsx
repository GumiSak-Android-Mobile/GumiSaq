import React from 'react';
import { Image } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  image: number | { uri: string }; // Bisa require() atau URL
};

export default function DraggableSticker({ image }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const lastOffset = {
    x: useSharedValue(0),
    y: useSharedValue(0),
  };

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      lastOffset.x.value = translateX.value;
      lastOffset.y.value = translateY.value;
    },
  });

  const pinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      scale.value = withTiming(scale.value, { duration: 100 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <PinchGestureHandler onGestureEvent={pinchGesture}>
      <Animated.View style={[{ position: 'absolute', left: 100, top: 200 }, animatedStyle]}>
        <PanGestureHandler onGestureEvent={panGesture}>
          <Animated.View>
            <Image source={image} style={{ width: 100, height: 100 }} resizeMode="contain" />
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </PinchGestureHandler>
  );
}
