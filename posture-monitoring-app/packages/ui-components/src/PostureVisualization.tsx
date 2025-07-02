import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { SKELETON_CONNECTIONS, getKeypointByName } from '@posture-monitor/pose-detection';
import { PostureVisualizationProps } from './types';

export const PostureVisualization: React.FC<PostureVisualizationProps> = ({
  pose,
  imageSize,
  viewSize,
  showSkeleton = true,
  showKeypoints = true,
  keypointRadius = 5,
  skeletonWidth = 2,
  theme
}) => {
  if (!pose) return null;

  const scaleX = viewSize.width / imageSize.width;
  const scaleY = viewSize.height / imageSize.height;

  const getScaledPosition = (x: number, y: number) => ({
    x: x * scaleX * imageSize.width,
    y: y * scaleY * imageSize.height,
  });

  const colors = theme?.colors || {
    primary: '#4CAF50',
    secondary: '#2196F3',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
  };

  const getKeypointColor = (confidence: number) => {
    if (confidence > 0.7) return colors.success;
    if (confidence > 0.4) return colors.warning;
    return colors.error;
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Svg width={viewSize.width} height={viewSize.height}>
        {showSkeleton && SKELETON_CONNECTIONS.map((connection, index) => {
          const [start, end] = connection;
          const startKeypoint = getKeypointByName(pose.keypoints, start);
          const endKeypoint = getKeypointByName(pose.keypoints, end);

          if (!startKeypoint || !endKeypoint) return null;
          if (startKeypoint.score < 0.3 || endKeypoint.score < 0.3) return null;

          const startPos = getScaledPosition(startKeypoint.x, startKeypoint.y);
          const endPos = getScaledPosition(endKeypoint.x, endKeypoint.y);

          return (
            <Line
              key={`skeleton-${index}`}
              x1={startPos.x}
              y1={startPos.y}
              x2={endPos.x}
              y2={endPos.y}
              stroke={colors.primary}
              strokeWidth={skeletonWidth}
              opacity={Math.min(startKeypoint.score, endKeypoint.score)}
            />
          );
        })}

        {showKeypoints && pose.keypoints.map((keypoint, index) => {
          if (keypoint.score < 0.3) return null;

          const pos = getScaledPosition(keypoint.x, keypoint.y);
          const color = getKeypointColor(keypoint.score);

          return (
            <Circle
              key={`keypoint-${index}`}
              cx={pos.x}
              cy={pos.y}
              r={keypointRadius}
              fill={color}
              opacity={keypoint.score}
            />
          );
        })}
      </Svg>
    </View>
  );
};