import React from "react";
import { Canvas, useImage,Image, SkImage } from "@shopify/react-native-skia";
import {useWindowDimensions} from 'react-native'
const Index = () => {
    const bg= useImage(require('@/assets/sprites/background-day.png'))
    const bird =useImage(require('@/assets/sprites/yellowbird-upflap.png'))
    const pipeBottom =useImage(require('@/assets/sprites/pipe-green.png'))
    const pipeTop =useImage(require('@/assets/sprites/pipe-green-top.png'))
    const base =useImage(require('@/assets/sprites/base.png'))
    const {width,height} =useWindowDimensions()
 const pipeOffset=0;
  return (
    <Canvas style={{ width, height }} >
    {/* bg */}
    <Image image={bg} width={width} height={height} fit={'cover'} />
    {/* pipe */}
    <Image image={pipeTop} y={pipeOffset-320} x={width/2} height={640} width={104} />
    <Image image={pipeBottom} y={height-320+pipeOffset} x={width/2} height={640} width={104} />
  {/* base */}
  <Image image={base}  width={width} height={100} y={height-75} x={0} fit={'cover'} /> 
  {/* bird */}
    <Image image={bird} y={height/2} x={width/4} width={64} height={48} />
    {/* pipe */}

    </Canvas>
  );
};

export default Index;