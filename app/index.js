import React, { useEffect } from "react";
import { Canvas, useImage, Image, SkImage } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import {
  Easing,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture
} from "react-native-gesture-handler";

const Gravity = 500;
const Index = () => {
  const bg = useImage(require("@/assets/sprites/background-day.png"));
  const bird = useImage(require("@/assets/sprites/yellowbird-upflap.png"));
  const pipeBottom = useImage(require("@/assets/sprites/pipe-green.png"));
  const pipeTop = useImage(require("@/assets/sprites/pipe-green-top.png"));
  const base = useImage(require("@/assets/sprites/base.png"));
  const { width, height } = useWindowDimensions();
  const x = useSharedValue(width);
  const pipeOffset = 0;
  const birdY = useSharedValue(0);
  const birdYVelocity = useSharedValue(100);
  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (!dt) {
      return;
    }

    birdY.value = birdY.value + (birdYVelocity.value * dt) / 1000;
    birdYVelocity.value = birdYVelocity.value + (Gravity * dt) / 1000;
  });
  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(-100, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 })
      ),
      -1
    );
  }, []);
  const gesture =Gesture.Tap().onStart(()=>{
    birdYVelocity.value = -300
  })
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
      <Canvas
        style={{ width, height }}

      >
        {/* bg */}
        <Image image={bg} width={width} height={height} fit={"cover"} />
        {/* pipe */}
        <Image
          image={pipeTop}
          y={pipeOffset - 320}
          x={x}
          height={640}
          width={104}
        />
        <Image
          image={pipeBottom}
          y={height - 320 + pipeOffset}
          x={x}
          height={640}
          width={104}
        />
        {/* base */}
        <Image
          image={base}
          width={width}
          height={110}
          y={height - 70}
          x={0}
          fit={"cover"}
        />
        {/* bird */}
        <Image image={bird} y={birdY} x={width / 4} width={64} height={48} />
      </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default Index;
