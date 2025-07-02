import { Pose, getKeypointByName, KeypointNames } from '@posture-monitor/pose-detection';
import {
  PostureIssue,
  PostureIssueType,
  IssueSeverity,
  AngleMetrics,
  UserBaseline
} from './types';
import { calculateAngleDeviation } from './utils';

export function detectPostureIssues(
  pose: Pose,
  angles: AngleMetrics,
  baseline: UserBaseline | null,
  threshold: number = 0.5
): PostureIssue[] {
  const issues: PostureIssue[] = [];

  // Check for forward head posture
  const forwardHeadIssue = detectForwardHead(angles, baseline);
  if (forwardHeadIssue) issues.push(forwardHeadIssue);

  // Check for rounded shoulders
  const roundedShouldersIssue = detectRoundedShoulders(pose, angles);
  if (roundedShouldersIssue) issues.push(roundedShouldersIssue);

  // Check for slouching
  const slouchingIssue = detectSlouching(angles, baseline);
  if (slouchingIssue) issues.push(slouchingIssue);

  // Check for uneven hips
  const unevenHipsIssue = detectUnevenHips(pose);
  if (unevenHipsIssue) issues.push(unevenHipsIssue);

  // Check for uneven shoulders
  const unevenShouldersIssue = detectUnevenShoulders(pose);
  if (unevenShouldersIssue) issues.push(unevenShouldersIssue);

  return issues.filter(issue => 
    issue.severity === IssueSeverity.SEVERE ||
    (issue.severity === IssueSeverity.MODERATE && threshold <= 0.5) ||
    threshold <= 0.3
  );
}

function detectForwardHead(angles: AngleMetrics, baseline: UserBaseline | null): PostureIssue | null {
  const optimalNeckAngle = baseline?.optimalAngles.neckAngle || 15;
  const deviation = calculateAngleDeviation(angles.neckAngle, optimalNeckAngle);

  if (deviation > 10) {
    const severity = deviation > 25 ? IssueSeverity.SEVERE :
                    deviation > 15 ? IssueSeverity.MODERATE :
                    IssueSeverity.MILD;

    return {
      id: 'forward-head-' + Date.now(),
      type: PostureIssueType.FORWARD_HEAD,
      severity,
      bodyPart: 'head and neck',
      description: 'Your head is positioned too far forward',
      recommendation: 'Pull your chin back and align your ears over your shoulders',
      angle: angles.neckAngle,
      threshold: optimalNeckAngle
    };
  }

  return null;
}

function detectRoundedShoulders(pose: Pose, angles: AngleMetrics): PostureIssue | null {
  const leftShoulder = getKeypointByName(pose.keypoints, KeypointNames.LEFT_SHOULDER);
  const rightShoulder = getKeypointByName(pose.keypoints, KeypointNames.RIGHT_SHOULDER);
  const neck = getKeypointByName(pose.keypoints, KeypointNames.NECK);

  if (!leftShoulder || !rightShoulder || !neck) return null;

  // Check if shoulders are forward of the neck
  const shoulderForwardness = ((leftShoulder.x + rightShoulder.x) / 2) - neck.x;
  
  if (Math.abs(shoulderForwardness) > 0.05) {
    const severity = Math.abs(shoulderForwardness) > 0.1 ? IssueSeverity.SEVERE :
                    Math.abs(shoulderForwardness) > 0.07 ? IssueSeverity.MODERATE :
                    IssueSeverity.MILD;

    return {
      id: 'rounded-shoulders-' + Date.now(),
      type: PostureIssueType.ROUNDED_SHOULDERS,
      severity,
      bodyPart: 'shoulders',
      description: 'Your shoulders are rounded forward',
      recommendation: 'Roll your shoulders back and down, opening your chest'
    };
  }

  return null;
}

function detectSlouching(angles: AngleMetrics, baseline: UserBaseline | null): PostureIssue | null {
  const optimalSpineAngle = baseline?.optimalAngles.spineAngle || 95;
  const deviation = calculateAngleDeviation(angles.spineAngle, optimalSpineAngle);

  if (deviation > 10) {
    const severity = deviation > 25 ? IssueSeverity.SEVERE :
                    deviation > 15 ? IssueSeverity.MODERATE :
                    IssueSeverity.MILD;

    return {
      id: 'slouching-' + Date.now(),
      type: PostureIssueType.SLOUCHING,
      severity,
      bodyPart: 'spine',
      description: 'You are slouching - your spine is not properly aligned',
      recommendation: 'Sit up straight, engage your core, and maintain the natural curve of your spine',
      angle: angles.spineAngle,
      threshold: optimalSpineAngle
    };
  }

  return null;
}

function detectUnevenHips(pose: Pose): PostureIssue | null {
  const leftHip = getKeypointByName(pose.keypoints, KeypointNames.LEFT_HIP);
  const rightHip = getKeypointByName(pose.keypoints, KeypointNames.RIGHT_HIP);

  if (!leftHip || !rightHip) return null;

  const hipDifference = Math.abs(leftHip.y - rightHip.y);
  
  if (hipDifference > 0.05) {
    const severity = hipDifference > 0.1 ? IssueSeverity.SEVERE :
                    hipDifference > 0.07 ? IssueSeverity.MODERATE :
                    IssueSeverity.MILD;

    return {
      id: 'uneven-hips-' + Date.now(),
      type: PostureIssueType.UNEVEN_HIPS,
      severity,
      bodyPart: 'hips',
      description: 'Your hips are uneven',
      recommendation: 'Ensure equal weight distribution and check your sitting position'
    };
  }

  return null;
}

function detectUnevenShoulders(pose: Pose): PostureIssue | null {
  const leftShoulder = getKeypointByName(pose.keypoints, KeypointNames.LEFT_SHOULDER);
  const rightShoulder = getKeypointByName(pose.keypoints, KeypointNames.RIGHT_SHOULDER);

  if (!leftShoulder || !rightShoulder) return null;

  const shoulderDifference = Math.abs(leftShoulder.y - rightShoulder.y);
  
  if (shoulderDifference > 0.05) {
    const severity = shoulderDifference > 0.1 ? IssueSeverity.SEVERE :
                    shoulderDifference > 0.07 ? IssueSeverity.MODERATE :
                    IssueSeverity.MILD;

    return {
      id: 'uneven-shoulders-' + Date.now(),
      type: PostureIssueType.UNEVEN_SHOULDERS,
      severity,
      bodyPart: 'shoulders',
      description: 'Your shoulders are uneven',
      recommendation: 'Relax your shoulders and ensure they are level'
    };
  }

  return null;
}

export function prioritizeIssues(issues: PostureIssue[]): PostureIssue[] {
  return issues.sort((a, b) => {
    // Sort by severity first
    const severityOrder = {
      [IssueSeverity.SEVERE]: 0,
      [IssueSeverity.MODERATE]: 1,
      [IssueSeverity.MILD]: 2
    };

    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    // Then by issue type priority
    const priorityOrder = {
      [PostureIssueType.SLOUCHING]: 0,
      [PostureIssueType.FORWARD_HEAD]: 1,
      [PostureIssueType.ROUNDED_SHOULDERS]: 2,
      [PostureIssueType.UNEVEN_SHOULDERS]: 3,
      [PostureIssueType.UNEVEN_HIPS]: 4,
      [PostureIssueType.EXCESSIVE_LORDOSIS]: 5,
      [PostureIssueType.EXCESSIVE_KYPHOSIS]: 6
    };

    return priorityOrder[a.type] - priorityOrder[b.type];
  });
}