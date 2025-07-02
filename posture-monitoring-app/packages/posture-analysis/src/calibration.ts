import { Pose } from '@posture-monitor/pose-detection';
import { UserBaseline, CalibrationData, PostureType, AngleMetrics } from './types';
import { calculateAngles, detectPostureType } from './utils';

export class CalibrationManager {
  private calibrationSamples: Pose[] = [];
  private minSamples: number = 30;
  private maxSamples: number = 60;

  constructor(minSamples: number = 30) {
    this.minSamples = minSamples;
    this.maxSamples = minSamples * 2;
  }

  addSample(pose: Pose): boolean {
    if (this.calibrationSamples.length >= this.maxSamples) {
      // Remove oldest sample
      this.calibrationSamples.shift();
    }

    this.calibrationSamples.push(pose);
    return this.isCalibrationComplete();
  }

  isCalibrationComplete(): boolean {
    return this.calibrationSamples.length >= this.minSamples;
  }

  getProgress(): number {
    return Math.min(100, (this.calibrationSamples.length / this.minSamples) * 100);
  }

  createBaseline(userId: string): UserBaseline | null {
    if (!this.isCalibrationComplete()) {
      return null;
    }

    // Detect most common posture type
    const postureTypes = this.calibrationSamples.map(detectPostureType);
    const postureType = this.getMostCommonPostureType(postureTypes);

    // Calculate average angles
    const allAngles = this.calibrationSamples.map(calculateAngles);
    const optimalAngles = this.calculateAverageAngles(allAngles);

    return {
      userId,
      postureType,
      optimalAngles,
      samples: [...this.calibrationSamples],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getMostCommonPostureType(types: PostureType[]): PostureType {
    const counts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<PostureType, number>);

    return Object.entries(counts).reduce((a, b) => 
      counts[a[0] as PostureType] > counts[b[0] as PostureType] ? a : b
    )[0] as PostureType;
  }

  private calculateAverageAngles(allAngles: AngleMetrics[]): AngleMetrics {
    const sum = allAngles.reduce((acc, angles) => ({
      neckAngle: acc.neckAngle + angles.neckAngle,
      shoulderAngle: acc.shoulderAngle + angles.shoulderAngle,
      spineAngle: acc.spineAngle + angles.spineAngle,
      hipAngle: acc.hipAngle + angles.hipAngle,
      kneeAngle: acc.kneeAngle + angles.kneeAngle
    }), {
      neckAngle: 0,
      shoulderAngle: 0,
      spineAngle: 0,
      hipAngle: 0,
      kneeAngle: 0
    });

    const count = allAngles.length;

    return {
      neckAngle: sum.neckAngle / count,
      shoulderAngle: sum.shoulderAngle / count,
      spineAngle: sum.spineAngle / count,
      hipAngle: sum.hipAngle / count,
      kneeAngle: sum.kneeAngle / count
    };
  }

  reset(): void {
    this.calibrationSamples = [];
  }

  getSamples(): Pose[] {
    return [...this.calibrationSamples];
  }
}

export function updateBaseline(
  baseline: UserBaseline,
  newPoses: Pose[],
  weight: number = 0.1
): UserBaseline {
  const newAngles = newPoses.map(calculateAngles);
  const avgNewAngles = newAngles.reduce((acc, angles, _, arr) => ({
    neckAngle: acc.neckAngle + angles.neckAngle / arr.length,
    shoulderAngle: acc.shoulderAngle + angles.shoulderAngle / arr.length,
    spineAngle: acc.spineAngle + angles.spineAngle / arr.length,
    hipAngle: acc.hipAngle + angles.hipAngle / arr.length,
    kneeAngle: acc.kneeAngle + angles.kneeAngle / arr.length
  }), {
    neckAngle: 0,
    shoulderAngle: 0,
    spineAngle: 0,
    hipAngle: 0,
    kneeAngle: 0
  });

  // Weighted average with existing baseline
  const updatedAngles: AngleMetrics = {
    neckAngle: baseline.optimalAngles.neckAngle * (1 - weight) + avgNewAngles.neckAngle * weight,
    shoulderAngle: baseline.optimalAngles.shoulderAngle * (1 - weight) + avgNewAngles.shoulderAngle * weight,
    spineAngle: baseline.optimalAngles.spineAngle * (1 - weight) + avgNewAngles.spineAngle * weight,
    hipAngle: baseline.optimalAngles.hipAngle * (1 - weight) + avgNewAngles.hipAngle * weight,
    kneeAngle: baseline.optimalAngles.kneeAngle * (1 - weight) + avgNewAngles.kneeAngle * weight
  };

  return {
    ...baseline,
    optimalAngles: updatedAngles,
    updatedAt: new Date()
  };
}