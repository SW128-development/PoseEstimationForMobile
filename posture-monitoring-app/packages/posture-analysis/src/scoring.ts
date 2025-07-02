import { Pose } from '@posture-monitor/pose-detection';
import { PostureScore, PostureType, AngleMetrics, UserBaseline } from './types';
import { detectPostureType, calculateAngleDeviation } from './utils';

export function calculatePostureScore(
  pose: Pose,
  angles: AngleMetrics,
  baseline: UserBaseline | null
): PostureScore {
  const postureType = detectPostureType(pose);
  const optimalAngles = baseline?.optimalAngles || getDefaultOptimalAngles(postureType);

  // Calculate component scores
  const headScore = calculateHeadScore(angles.neckAngle, optimalAngles.neckAngle);
  const shouldersScore = calculateShouldersScore(angles.shoulderAngle, optimalAngles.shoulderAngle);
  const spineScore = calculateSpineScore(angles.spineAngle, optimalAngles.spineAngle);
  const hipsScore = calculateHipsScore(angles.hipAngle, optimalAngles.hipAngle);

  // Weight the scores based on importance
  const weights = {
    head: 0.25,
    shoulders: 0.25,
    spine: 0.3,
    hips: 0.2
  };

  const overall = 
    headScore * weights.head +
    shouldersScore * weights.shoulders +
    spineScore * weights.spine +
    hipsScore * weights.hips;

  return {
    overall: Math.round(overall),
    components: {
      head: Math.round(headScore),
      shoulders: Math.round(shouldersScore),
      spine: Math.round(spineScore),
      hips: Math.round(hipsScore)
    },
    timestamp: Date.now(),
    postureType
  };
}

function calculateHeadScore(actualAngle: number, optimalAngle: number): number {
  const deviation = calculateAngleDeviation(actualAngle, optimalAngle);
  
  // Score calculation based on deviation
  if (deviation <= 5) return 100;
  if (deviation <= 10) return 90;
  if (deviation <= 15) return 80;
  if (deviation <= 20) return 70;
  if (deviation <= 30) return 50;
  return 30;
}

function calculateShouldersScore(actualAngle: number, optimalAngle: number): number {
  const deviation = calculateAngleDeviation(actualAngle, optimalAngle);
  
  if (deviation <= 5) return 100;
  if (deviation <= 10) return 90;
  if (deviation <= 20) return 75;
  if (deviation <= 30) return 60;
  return 40;
}

function calculateSpineScore(actualAngle: number, optimalAngle: number): number {
  const deviation = calculateAngleDeviation(actualAngle, optimalAngle);
  
  // Spine alignment is critical
  if (deviation <= 5) return 100;
  if (deviation <= 10) return 85;
  if (deviation <= 15) return 70;
  if (deviation <= 25) return 50;
  return 30;
}

function calculateHipsScore(actualAngle: number, optimalAngle: number): number {
  const deviation = calculateAngleDeviation(actualAngle, optimalAngle);
  
  if (deviation <= 10) return 100;
  if (deviation <= 20) return 85;
  if (deviation <= 30) return 70;
  if (deviation <= 40) return 55;
  return 40;
}

function getDefaultOptimalAngles(postureType: PostureType): AngleMetrics {
  const optimalAngles: Record<PostureType, AngleMetrics> = {
    [PostureType.SITTING]: {
      neckAngle: 15,
      shoulderAngle: 90,
      spineAngle: 95,
      hipAngle: 90,
      kneeAngle: 90
    },
    [PostureType.STANDING]: {
      neckAngle: 0,
      shoulderAngle: 180,
      spineAngle: 180,
      hipAngle: 180,
      kneeAngle: 180
    },
    [PostureType.EXERCISING]: {
      neckAngle: 0,
      shoulderAngle: 180,
      spineAngle: 180,
      hipAngle: 180,
      kneeAngle: 180
    },
    [PostureType.UNKNOWN]: {
      neckAngle: 0,
      shoulderAngle: 180,
      spineAngle: 180,
      hipAngle: 180,
      kneeAngle: 180
    }
  };

  return optimalAngles[postureType];
}

export function calculateTrendScore(scores: PostureScore[]): number {
  if (scores.length < 2) return 0;

  const recentScores = scores.slice(-10); // Last 10 scores
  let trendSum = 0;

  for (let i = 1; i < recentScores.length; i++) {
    trendSum += recentScores[i].overall - recentScores[i - 1].overall;
  }

  return trendSum / (recentScores.length - 1);
}