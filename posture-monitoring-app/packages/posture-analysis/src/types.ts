import { Pose, Keypoint } from '@posture-monitor/pose-detection';

export interface PostureScore {
  overall: number;
  components: {
    head: number;
    shoulders: number;
    spine: number;
    hips: number;
  };
  timestamp: number;
  postureType: PostureType;
}

export enum PostureType {
  SITTING = 'sitting',
  STANDING = 'standing',
  EXERCISING = 'exercising',
  UNKNOWN = 'unknown'
}

export interface PostureIssue {
  id: string;
  type: PostureIssueType;
  severity: IssueSeverity;
  bodyPart: string;
  description: string;
  recommendation: string;
  angle?: number;
  threshold?: number;
}

export enum PostureIssueType {
  FORWARD_HEAD = 'forward_head',
  ROUNDED_SHOULDERS = 'rounded_shoulders',
  SLOUCHING = 'slouching',
  UNEVEN_HIPS = 'uneven_hips',
  UNEVEN_SHOULDERS = 'uneven_shoulders',
  EXCESSIVE_LORDOSIS = 'excessive_lordosis',
  EXCESSIVE_KYPHOSIS = 'excessive_kyphosis'
}

export enum IssueSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe'
}

export interface AngleMetrics {
  neckAngle: number;
  shoulderAngle: number;
  spineAngle: number;
  hipAngle: number;
  kneeAngle: number;
}

export interface UserBaseline {
  userId: string;
  postureType: PostureType;
  optimalAngles: AngleMetrics;
  samples: Pose[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CalibrationData {
  poses: Pose[];
  postureType: PostureType;
  duration: number;
}

export interface PostureAnalysisConfig {
  enableSmoothing?: boolean;
  smoothingFactor?: number;
  issueDetectionThreshold?: number;
  calibrationSamples?: number;
}

export interface PostureMetrics {
  currentPosture: PostureScore;
  issues: PostureIssue[];
  angles: AngleMetrics;
  improvement: number;
  duration: number;
}