import { Pose, Keypoint, KeypointNames, calculateAngle, getKeypointByName } from '@posture-monitor/pose-detection';
import {
  PostureScore,
  PostureType,
  PostureIssue,
  AngleMetrics,
  UserBaseline,
  PostureAnalysisConfig,
  PostureMetrics
} from './types';
import { calculatePostureScore } from './scoring';
import { detectPostureIssues } from './issues';
import { detectPostureType, calculateAngles } from './utils';

export class PostureAnalyzer {
  private config: Required<PostureAnalysisConfig>;
  private userBaseline: UserBaseline | null = null;
  private previousPose: Pose | null = null;

  constructor(config: PostureAnalysisConfig = {}) {
    this.config = {
      enableSmoothing: true,
      smoothingFactor: 0.7,
      issueDetectionThreshold: 0.5,
      calibrationSamples: 30,
      ...config
    };
  }

  setUserBaseline(baseline: UserBaseline): void {
    this.userBaseline = baseline;
  }

  analyzePose(pose: Pose): PostureMetrics {
    // Detect posture type
    const postureType = detectPostureType(pose);

    // Calculate angles
    const angles = calculateAngles(pose);

    // Calculate posture score
    const score = calculatePostureScore(pose, angles, this.userBaseline);

    // Detect issues
    const issues = detectPostureIssues(pose, angles, this.userBaseline, this.config.issueDetectionThreshold);

    // Calculate improvement if baseline exists
    let improvement = 0;
    if (this.userBaseline) {
      improvement = this.calculateImprovement(score.overall);
    }

    // Update previous pose for smoothing
    this.previousPose = pose;

    return {
      currentPosture: score,
      issues,
      angles,
      improvement,
      duration: 0 // This would be tracked by the calling component
    };
  }

  private calculateImprovement(currentScore: number): number {
    // This is a simplified improvement calculation
    // In a real app, you'd track historical scores
    const baselineScore = 70; // Example baseline
    return Math.max(0, currentScore - baselineScore);
  }

  evaluatePosture(pose: Pose): PostureScore {
    const postureType = detectPostureType(pose);
    const angles = calculateAngles(pose);
    return calculatePostureScore(pose, angles, this.userBaseline);
  }

  detectIssues(pose: Pose): PostureIssue[] {
    const angles = calculateAngles(pose);
    return detectPostureIssues(pose, angles, this.userBaseline, this.config.issueDetectionThreshold);
  }

  getOptimalAngles(postureType: PostureType): AngleMetrics {
    // Default optimal angles for different posture types
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

    return this.userBaseline?.optimalAngles || optimalAngles[postureType];
  }

  reset(): void {
    this.previousPose = null;
  }
}