import { KeypointNames } from './types';

export const KEYPOINT_INDICES = {
  [KeypointNames.TOP]: 0,
  [KeypointNames.NECK]: 1,
  [KeypointNames.LEFT_SHOULDER]: 2,
  [KeypointNames.RIGHT_SHOULDER]: 3,
  [KeypointNames.LEFT_ELBOW]: 4,
  [KeypointNames.RIGHT_ELBOW]: 5,
  [KeypointNames.LEFT_WRIST]: 6,
  [KeypointNames.RIGHT_WRIST]: 7,
  [KeypointNames.LEFT_HIP]: 8,
  [KeypointNames.RIGHT_HIP]: 9,
  [KeypointNames.LEFT_KNEE]: 10,
  [KeypointNames.RIGHT_KNEE]: 11,
  [KeypointNames.LEFT_ANKLE]: 12,
  [KeypointNames.RIGHT_ANKLE]: 13,
};

export const SKELETON_CONNECTIONS = [
  [KeypointNames.TOP, KeypointNames.NECK],
  [KeypointNames.NECK, KeypointNames.LEFT_SHOULDER],
  [KeypointNames.NECK, KeypointNames.RIGHT_SHOULDER],
  [KeypointNames.LEFT_SHOULDER, KeypointNames.LEFT_ELBOW],
  [KeypointNames.LEFT_ELBOW, KeypointNames.LEFT_WRIST],
  [KeypointNames.RIGHT_SHOULDER, KeypointNames.RIGHT_ELBOW],
  [KeypointNames.RIGHT_ELBOW, KeypointNames.RIGHT_WRIST],
  [KeypointNames.NECK, KeypointNames.LEFT_HIP],
  [KeypointNames.NECK, KeypointNames.RIGHT_HIP],
  [KeypointNames.LEFT_HIP, KeypointNames.RIGHT_HIP],
  [KeypointNames.LEFT_HIP, KeypointNames.LEFT_KNEE],
  [KeypointNames.LEFT_KNEE, KeypointNames.LEFT_ANKLE],
  [KeypointNames.RIGHT_HIP, KeypointNames.RIGHT_KNEE],
  [KeypointNames.RIGHT_KNEE, KeypointNames.RIGHT_ANKLE],
];

export const DEFAULT_CONFIG = {
  targetFPS: 20,
  minPoseConfidence: 0.3,
  enableGPU: true,
  enableQuantization: false,
  inputSize: { width: 192, height: 192 },
};