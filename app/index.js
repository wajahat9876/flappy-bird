import React, { useEffect } from "react";
import { Canvas, useImage, Image, SkImage ,Group} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import {
  Easing,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,

} from "react-native-gesture-handler";

const Gravity = 1000;
const Jump_Force=-400
const Index = () => {
  const bg = useImage(require("@/assets/sprites/background-day.png"));
  const bird = useImage(require("@/assets/sprites/yellowbird-upflap.png"));
  const pipeBottom = useImage(require("@/assets/sprites/pipe-green.png"));
  const pipeTop = useImage(require("@/assets/sprites/pipe-green-top.png"));
  const base = useImage(require("@/assets/sprites/base.png"));
  const { width, height } = useWindowDimensions();
  const x = useSharedValue(width);
  const pipeOffset = 0;
  const birdY = useSharedValue(height/3);
  const birdYVelocity = useSharedValue(0);
  const birdTransform =useDerivedValue(()=>{
    return [{rotate: interpolate( birdYVelocity.value,[-400,400],[-0.4,0.4],Extrapolation.CLAMP)}];
  });
  const birdOrigin=useDerivedValue(()=>{
    return  {x:width/4+32, y:birdY.value+24}
  })
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
    birdYVelocity.value = Jump_Force
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
        <Group transform={birdTransform} origin={birdOrigin}>
        <Image image={bird} y={birdY} x={width / 4} width={64} height={48} />
        </Group>
      </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default Index;
