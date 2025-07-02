import { Pose, Keypoint, KeypointNames, calculateAngle, getKeypointByName } from '@posture-monitor/pose-detection';
import { PostureType, AngleMetrics } from './types';

export function detectPostureType(pose: Pose): PostureType {
  const leftHip = getKeypointByName(pose.keypoints, KeypointNames.LEFT_HIP);
  const rightHip = getKeypointByName(pose.keypoints, KeypointNames.RIGHT_HIP);
  const leftKnee = getKeypointByName(pose.keypoints, KeypointNames.LEFT_KNEE);
  const rightKnee = getKeypointByName(pose.keypoints, KeypointNames.RIGHT_KNEE);
  const neck = getKeypointByName(pose.keypoints, KeypointNames.NECK);

  if (!leftHip || !rightHip || !leftKnee || !rightKnee || !neck) {
    return PostureType.UNKNOWN;
  }

  // Calculate average hip and knee positions
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  const avgKneeY = (leftKnee.y + rightKnee.y) / 2;

  // Check if sitting (knees are significantly higher than hips)
  const hipKneeRatio = Math.abs(avgHipY - avgKneeY);
  if (hipKneeRatio < 0.2) {
    return PostureType.SITTING;
  }

  // Check movement velocity for exercise detection (would need pose history)
  // For now, default to standing
  return PostureType.STANDING;
}

export function calculateAngles(pose: Pose): AngleMetrics {
  const angles: AngleMetrics = {
    neckAngle: 0,
    shoulderAngle: 0,
    spineAngle: 0,
    hipAngle: 0,
    kneeAngle: 0
  };

  // Calculate neck angle (head-neck-shoulders)
  const head = getKeypointByName(pose.keypoints, KeypointNames.TOP);
  const neck = getKeypointByName(pose.keypoints, KeypointNames.NECK);
  const leftShoulder = getKeypointByName(pose.keypoints, KeypointNames.LEFT_SHOULDER);
  const rightShoulder = getKeypointByName(pose.keypoints, KeypointNames.RIGHT_SHOULDER);

  if (head && neck && leftShoulder && rightShoulder) {
    const shoulderMidpoint: Keypoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
      score: (leftShoulder.score + rightShoulder.score) / 2,
      name: 'shoulderMidpoint'
    };
    angles.neckAngle = calculateAngle(head, neck, shoulderMidpoint);
  }

  // Calculate shoulder angle
  const leftElbow = getKeypointByName(pose.keypoints, KeypointNames.LEFT_ELBOW);
  if (neck && leftShoulder && leftElbow) {
    angles.shoulderAngle = calculateAngle(neck, leftShoulder, leftElbow);
  }

  // Calculate spine angle (approximate using neck-hip line)
  const leftHip = getKeypointByName(pose.keypoints, KeypointNames.LEFT_HIP);
  const rightHip = getKeypointByName(pose.keypoints, KeypointNames.RIGHT_HIP);
  
  if (neck && leftHip && rightHip) {
    const hipMidpoint: Keypoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
      score: (leftHip.score + rightHip.score) / 2,
      name: 'hipMidpoint'
    };
    
    // Create a vertical reference point
    const verticalReference: Keypoint = {
      x: hipMidpoint.x,
      y: hipMidpoint.y + 0.5,
      score: 1,
      name: 'verticalRef'
    };
    
    angles.spineAngle = calculateAngle(neck, hipMidpoint, verticalReference);
  }

  // Calculate hip angle
  const leftKnee = getKeypointByName(pose.keypoints, KeypointNames.LEFT_KNEE);
  if (leftShoulder && leftHip && leftKnee) {
    angles.hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  }

  // Calculate knee angle
  const leftAnkle = getKeypointByName(pose.keypoints, KeypointNames.LEFT_ANKLE);
  if (leftHip && leftKnee && leftAnkle) {
    angles.kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  }

  return angles;
}

export function normalizeAngle(angle: number): number {
  // Normalize angle to 0-180 range
  return Math.min(180, Math.max(0, angle));
}

export function calculateAngleDeviation(actual: number, optimal: number): number {
  return Math.abs(actual - optimal);
}

export function interpolateKeypoints(pose1: Pose, pose2: Pose, factor: number): Pose {
  const interpolatedKeypoints = pose1.keypoints.map((kp1, index) => {
    const kp2 = pose2.keypoints[index];
    return {
      ...kp1,
      x: kp1.x * (1 - factor) + kp2.x * factor,
      y: kp1.y * (1 - factor) + kp2.y * factor,
      score: kp1.score * (1 - factor) + kp2.score * factor
    };
  });

  return {
    keypoints: interpolatedKeypoints,
    score: pose1.score * (1 - factor) + pose2.score * factor,
    timestamp: Date.now()
  };
}