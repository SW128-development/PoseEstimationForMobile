import { Keypoint, KeypointNames } from './types';
import { KEYPOINT_INDICES } from './constants';

export function extractKeypoints(heatmaps: number[][][]): Keypoint[] {
  const keypoints: Keypoint[] = [];
  const [height, width, numKeypoints] = [heatmaps.length, heatmaps[0].length, heatmaps[0][0].length];

  for (let k = 0; k < numKeypoints; k++) {
    let maxVal = -1;
    let maxX = -1;
    let maxY = -1;

    // Find the maximum value in the heatmap
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const val = heatmaps[y][x][k];
        if (val > maxVal) {
          maxVal = val;
          maxX = x;
          maxY = y;
        }
      }
    }

    // Convert to normalized coordinates
    const keypointName = Object.entries(KEYPOINT_INDICES).find(
      ([_, index]) => index === k
    )?.[0] || `keypoint_${k}`;

    keypoints.push({
      x: maxX / width,
      y: maxY / height,
      score: sigmoid(maxVal),
      name: keypointName,
    });
  }

  return keypoints;
}

export function calculatePoseScore(keypoints: Keypoint[]): number {
  if (keypoints.length === 0) return 0;
  
  const scores = keypoints.map(kp => kp.score);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Weight by number of high-confidence keypoints
  const highConfidenceCount = scores.filter(score => score > 0.5).length;
  const confidenceRatio = highConfidenceCount / scores.length;
  
  return avgScore * confidenceRatio;
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let degrees = Math.abs(radians * 180 / Math.PI);
  
  if (degrees > 180) {
    degrees = 360 - degrees;
  }
  
  return degrees;
}

export function calculateDistance(p1: Keypoint, p2: Keypoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function getKeypointByName(keypoints: Keypoint[], name: string): Keypoint | undefined {
  return keypoints.find(kp => kp.name === name);
}

export function smoothKeypoints(
  currentKeypoints: Keypoint[],
  previousKeypoints: Keypoint[] | null,
  smoothingFactor: number = 0.7
): Keypoint[] {
  if (!previousKeypoints) return currentKeypoints;

  return currentKeypoints.map((current, index) => {
    const previous = previousKeypoints[index];
    if (!previous) return current;

    return {
      ...current,
      x: current.x * smoothingFactor + previous.x * (1 - smoothingFactor),
      y: current.y * smoothingFactor + previous.y * (1 - smoothingFactor),
    };
  });
}