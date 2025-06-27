import React from 'react';
import { Image } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
  RotationGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

type Sticker = {
  id: string;
  imageUri: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flip: boolean;
};

type Props = {
  sticker: Sticker;
  onUpdate: (updated: Sticker) => void;
};

export default function StickerItem({ sticker, onUpdate }: Props) {
  const translateX = useSharedValue(sticker.x);
  const translateY = useSharedValue(sticker.y);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);

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
      runOnJS(onUpdate)({
        ...sticker,
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    },
  });

  const pinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive: (event) => {
      scale.value = sticker.scale * event.scale;
    },
    onEnd: () => {
      runOnJS(onUpdate)({
        ...sticker,
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    },
  });

  const rotationGesture = useAnimatedGestureHandler<RotationGestureHandlerGestureEvent>({
    onActive: (event) => {
      rotation.value = sticker.rotation + event.rotation;
    },
    onEnd: () => {
      runOnJS(onUpdate)({
        ...sticker,
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: translateX.value - 50,
      top: translateY.value - 50,
      transform: [
        { scaleX: sticker.flip ? -scale.value : scale.value },
        { scaleY: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={panGesture}>
      <Animated.View style={animatedStyle}>
        <PinchGestureHandler onGestureEvent={pinchGesture}>
          <Animated.View>
            <RotationGestureHandler onGestureEvent={rotationGesture}>
              <Animated.Image
                source={{ uri: sticker.imageUri }}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </RotationGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}
