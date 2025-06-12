import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { 
  Pose, 
  VisualizationConfig, 
  DEFAULT_VISUALIZATION_CONFIG,
  SKELETON_CONNECTIONS,
  PoseVisualizationProps 
} from '../types';

export const PoseVisualization: React.FC<PoseVisualizationProps> = ({
  pose,
  imageSize,
  viewSize,
  config = {},
  style
}) => {
  const visualConfig: VisualizationConfig = { 
    ...DEFAULT_VISUALIZATION_CONFIG, 
    ...config 
  };

  if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
    return <View style={[StyleSheet.absoluteFillObject, style]} />;
  }

  const scaleX = viewSize.width / imageSize.width;
  const scaleY = viewSize.height / imageSize.height;
  
  const scaledKeypoints = pose.keypoints.map(kp => ({
    ...kp,
    x: kp.x * scaleX,
    y: kp.y * scaleY
  }));

  const renderSkeleton = () => {
    if (!visualConfig.showSkeleton) return null;

    return SKELETON_CONNECTIONS.map(([startIdx, endIdx], index) => {
      const start = scaledKeypoints[startIdx];
      const end = scaledKeypoints[endIdx];
      
      if (start?.confidence > visualConfig.confidenceThreshold && 
          end?.confidence > visualConfig.confidenceThreshold) {
        return (
          <Line
            key={`skeleton-${index}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={visualConfig.colors.skeleton}
            strokeWidth={visualConfig.skeletonWidth}
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
        );
      }
      return null;
    });
  };

  const renderKeypoints = () => {
    if (!visualConfig.showKeypoints) return null;

    return scaledKeypoints.map((kp, index) => {
      if (kp.confidence <= visualConfig.confidenceThreshold) return null;

      const color = visualConfig.colors.keypoints[index] || '#FFFFFF';
      const opacity = Math.min(kp.confidence * 2, 1); // Scale opacity with confidence

      return (
        <Circle
          key={`keypoint-${index}`}
          cx={kp.x}
          cy={kp.y}
          r={visualConfig.keypointRadius}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2"
          fillOpacity={opacity}
        />
      );
    });
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, style]}>
      <Svg 
        width={viewSize.width} 
        height={viewSize.height}
        style={StyleSheet.absoluteFillObject}
      >
        <G>
          {renderSkeleton()}
          {renderKeypoints()}
        </G>
      </Svg>
    </View>
  );
};
