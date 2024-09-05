import React, { useEffect, useState } from "react";
import {
  Canvas,
  useImage,
  Image,
  SkImage,
  Group,
  Text,
  matchFont,
  Circle,
} from "@shopify/react-native-skia";
import { useWindowDimensions, Platform } from "react-native";
import {
  Easing,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";

const Gravity = 1000;
const Jump_Force = -350;
const pipeWidth = 104;
const pipeHeight = 550;
const Index = () => {
  const bg = useImage(require("@/assets/sprites/background-day.png"));
  const bird = useImage(require("@/assets/sprites/birdd.png"));

  const pipeBottom = useImage(require("@/assets/sprites/pipe-green.png"));
  const pipeTop = useImage(require("@/assets/sprites/pipe-green-top.png"));
  const base = useImage(require("@/assets/sprites/base.png"));
  const { width, height } = useWindowDimensions();
  const x = useSharedValue(width);
  const pipeOffset = useSharedValue(0);
  const birdY = useSharedValue(height / 3);
  const birdYVelocity = useSharedValue(0);
  const topPipeY = useDerivedValue(() => pipeOffset.value - 320);
  const bottomPipeY = useDerivedValue(() => height - 320 + pipeOffset.value);
  const gameOver = useSharedValue(false);
  //Scoring
  const birdPos = {
    x: width / 4,
  };
  const birdCenterX = useDerivedValue(() => birdPos.x + 32);
  const birdCenterY = useDerivedValue(() => birdY.value + 24);
  const [score, setScore] = useState(0);
  const obstacles = useDerivedValue(() => {
    const allObstacles = [];
    //add bottom pipescr
    allObstacles.push({
      x: x.value,
      y: bottomPipeY.value,
      h: pipeHeight,
      w: pipeWidth,
    });
    //add top pipes
    allObstacles.push({
      x: x.value,
      y: topPipeY.value,
      h: pipeHeight,
      w: pipeWidth,
    });
    return allObstacles;
  });
  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (!dt || gameOver.value) {
      return;
    }
    birdY.value = birdY.value + (birdYVelocity.value * dt) / 1000;
    birdYVelocity.value = birdYVelocity.value + (Gravity * dt) / 1000;
  });

  const isPointCollidingWithRect = (point, rect) => {
    "worklet";
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.w &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.h
    );
  };
  //Collision Detection
  useAnimatedReaction(
    () => birdY.value,
    (currentValue, previousValue) => {
      //ground collison detection
      if (currentValue > height - 110 || currentValue < 0) {
        
        gameOver.value = true;
      }
      const isColliding = obstacles.value.some((rect) =>
        isPointCollidingWithRect(
          { x: birdCenterX.value, y: birdCenterY.value },
          rect
        )
      );
      if (isColliding) {
        gameOver.value = true;
      }
      // //Bottom Pipe
      // if (
      //   birdCenterX.value >= x.value &&
      //   birdCenterX.value <= x.value + pipeWidth &&
      //   birdCenterY.value >= height - 320 + pipeOffset &&
      //   birdCenterY.value <= height - 320 + pipeOffset + pipeHeight
      // ) {
      //   console.log("Game over Bottom ");
      //   gameOver.value = true;
      // }
      // //Top Pipe
      // if (
      //   birdCenterX.value >= x.value &&
      //   birdCenterX.value <= x.value + pipeWidth &&
      //   birdCenterY.value >= pipeOffset - 320 &&
      //   birdCenterY.value <= pipeOffset - 320 + pipeHeight
      // ) {
      //   console.log("Game over Bottom ");
      //   gameOver.value = true;
      // }
    }
  );
  //StopAnimation On GameOver
  useAnimatedReaction(
    () => gameOver.value,
    (currentValue, previousValue) => {
      if (currentValue && !previousValue) {
        cancelAnimation(x);
      }
    }
  );

  const moveTheMap = () => {
    console.log('true')
    x.value = withRepeat(
      withSequence(
        withTiming(-100, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 })
      ),
      -1
    );
  };
  useEffect(() => {
    // Start moving the pipes when the game is first loaded
    moveTheMap();
  }, []);
  //Scoring System
  useAnimatedReaction(
    () => x.value,
    (currentValue, previousValue) => {
      const middle = birdPos.x;
      if (previousValue && currentValue < -99 && previousValue > -100) {
        console.log('Change Offset')
        pipeOffset.value =Math.random()*400-200
      }
      if (
        currentValue !== previousValue &&
        previousValue &&
        currentValue <= middle &&
        previousValue > middle
      ) {
        runOnJS(setScore)(score + 1);
      }
    }
  );
  //Restart Game
  const restartGame = () => {
    "worklet";
    birdY.value = height / 3;
    birdYVelocity.value = 0;
    gameOver.value = false;
    runOnJS(setScore)(0);
    runOnJS(moveTheMap)();
    x.value = width;
  };
  //Gesture
  const gesture = Gesture.Tap().onStart(() => {
    if (gameOver.value) {
      restartGame();
    } else {
      birdYVelocity.value = Jump_Force;
    }
  });
  //DerivedValues
  const birdTransform = useDerivedValue(() => {
    return [
      {
        rotate: interpolate(
          birdYVelocity.value,
          [-400, 400],
          [-0.4, 0.4],
          Extrapolation.CLAMP
        ),
      },
    ];
  });
  const birdOrigin = useDerivedValue(() => {
    return { x: width / 4 + 32, y: birdY.value + 24 };
  });
  const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
  const fontStyle = {
    fontFamily,
    fontSize: 26,
    fontStyle: "italic",
    fontWeight: "bold",
  };
  const font = matchFont(fontStyle);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height }}>
          {/* bg */}
          <Image image={bg} width={width} height={height} fit={"cover"} />
         
          {/* pipe */}
          <Image
            image={pipeTop}
            y={topPipeY}
            x={x}
            height={pipeHeight}
            width={pipeWidth}
          />
          <Image
            image={pipeBottom}
            y={bottomPipeY}
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
            <Image
              image={bird}
              y={birdY}
              x={birdPos.x}
              width={64}
              height={48}
            />
          </Group>
          {/* <Circle cy={birdCenterY} cx={birdCenterX} color={"red"} r={15} /> */}
          <Text
            x={width / 2 - 50}
            y={70}
            text={`Score: ${score.toString()}`}
            color="black"
            font={font}
          />
         
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};
export default Index;
