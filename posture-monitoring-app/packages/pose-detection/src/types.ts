export interface Keypoint {
  x: number;
  y: number;
  score: number;
  name: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score: number;
  timestamp: number;
}

export interface PoseDetectorConfig {
  modelPath: string;
  modelType: 'cpm' | 'hourglass';
  targetFPS?: number;
  minPoseConfidence?: number;
  enableGPU?: boolean;
  enableQuantization?: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  inferenceTime: number;
  preprocessTime: number;
  postprocessTime: number;
  memoryUsage: number;
}

export enum KeypointNames {
  TOP = 'top',
  NECK = 'neck',
  LEFT_SHOULDER = 'leftShoulder',
  RIGHT_SHOULDER = 'rightShoulder',
  LEFT_ELBOW = 'leftElbow',
  RIGHT_ELBOW = 'rightElbow',
  LEFT_WRIST = 'leftWrist',
  RIGHT_WRIST = 'rightWrist',
  LEFT_HIP = 'leftHip',
  RIGHT_HIP = 'rightHip',
  LEFT_KNEE = 'leftKnee',
  RIGHT_KNEE = 'rightKnee',
  LEFT_ANKLE = 'leftAnkle',
  RIGHT_ANKLE = 'rightAnkle'
}

export interface ModelInfo {
  name: string;
  inputSize: { width: number; height: number };
  outputStride: number;
  quantized: boolean;
}