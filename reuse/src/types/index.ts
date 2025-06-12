// Type definitions for pose estimation components

export interface Keypoint {
  id: number;
  x: number;
  y: number;
  confidence: number;
}

export interface Pose {
  keypoints: Keypoint[];
  confidence: number;
}

export interface ModelConfig {
  inputSize: {
    width: number;
    height: number;
  };
  outputSize: {
    width: number;
    height: number;
  };
  numKeypoints: number;
  channels: number;
  dataType: 'float32' | 'int8';
}

export interface CameraConfig {
  width: number;
  height: number;
  fps: number;
  facing: 'front' | 'back';
}

export interface PerformanceMetrics {
  fps: number;
  inferenceTime: number;
  memoryUsage: number;
  frameDrops: number;
}

export interface VisualizationConfig {
  showKeypoints: boolean;
  showSkeleton: boolean;
  keypointRadius: number;
  skeletonWidth: number;
  confidenceThreshold: number;
  colors: {
    keypoints: string[];
    skeleton: string;
  };
}

// Keypoint indices mapping
export enum KeypointIndex {
  TOP = 0,
  NECK = 1,
  L_SHOULDER = 2,
  L_ELBOW = 3,
  L_WRIST = 4,
  R_SHOULDER = 5,
  R_ELBOW = 6,
  R_WRIST = 7,
  L_HIP = 8,
  L_KNEE = 9,
  L_ANKLE = 10,
  R_HIP = 11,
  R_KNEE = 12,
  R_ANKLE = 13,
}

// Skeleton connections
export type SkeletonConnection = [number, number];

export const SKELETON_CONNECTIONS: SkeletonConnection[] = [
  [KeypointIndex.TOP, KeypointIndex.NECK],
  [KeypointIndex.NECK, KeypointIndex.L_SHOULDER],
  [KeypointIndex.NECK, KeypointIndex.R_SHOULDER],
  [KeypointIndex.NECK, KeypointIndex.L_HIP],
  [KeypointIndex.NECK, KeypointIndex.R_HIP],
  [KeypointIndex.L_SHOULDER, KeypointIndex.L_ELBOW],
  [KeypointIndex.L_ELBOW, KeypointIndex.L_WRIST],
  [KeypointIndex.R_SHOULDER, KeypointIndex.R_ELBOW],
  [KeypointIndex.R_ELBOW, KeypointIndex.R_WRIST],
  [KeypointIndex.L_HIP, KeypointIndex.L_KNEE],
  [KeypointIndex.L_KNEE, KeypointIndex.L_ANKLE],
  [KeypointIndex.R_HIP, KeypointIndex.R_KNEE],
  [KeypointIndex.R_KNEE, KeypointIndex.R_ANKLE],
];

// Default configurations
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  inputSize: { width: 192, height: 192 },
  outputSize: { width: 96, height: 96 },
  numKeypoints: 14,
  channels: 3,
  dataType: 'float32',
};

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  width: 640,
  height: 480,
  fps: 30,
  facing: 'back',
};

export const DEFAULT_VISUALIZATION_CONFIG: VisualizationConfig = {
  showKeypoints: true,
  showSkeleton: true,
  keypointRadius: 6,
  skeletonWidth: 3,
  confidenceThreshold: 0.3,
  colors: {
    keypoints: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9'
    ],
    skeleton: '#6fa8dc',
  },
};

// Error types
export class PoseEstimationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PoseEstimationError';
  }
}

export class ModelLoadError extends PoseEstimationError {
  constructor(message: string) {
    super(message, 'MODEL_LOAD_ERROR');
  }
}

export class InferenceError extends PoseEstimationError {
  constructor(message: string) {
    super(message, 'INFERENCE_ERROR');
  }
}

export class CameraError extends PoseEstimationError {
  constructor(message: string) {
    super(message, 'CAMERA_ERROR');
  }
}

// Component prop types
export interface PoseEstimationCameraProps {
  modelPath: string;
  onPoseDetected: (pose: Pose) => void;
  onError?: (error: PoseEstimationError) => void;
  cameraConfig?: Partial<CameraConfig>;
  style?: any;
}

export interface PoseVisualizationProps {
  pose: Pose | null;
  imageSize: { width: number; height: number };
  viewSize: { width: number; height: number };
  config?: Partial<VisualizationConfig>;
  style?: any;
}

export interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  onOptimizationNeeded?: () => void;
  style?: any;
}
