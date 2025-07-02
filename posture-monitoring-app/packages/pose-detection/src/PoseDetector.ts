import * as tf from '@tensorflow/tfjs';
import { Pose, PoseDetectorConfig, PerformanceMetrics, Keypoint } from './types';
import { DEFAULT_CONFIG, KEYPOINT_INDICES } from './constants';
import { extractKeypoints, calculatePoseScore } from './utils';

export class PoseDetector {
  private model: tf.GraphModel | null = null;
  private config: Required<PoseDetectorConfig>;
  private lastInferenceTime: number = 0;
  private performanceMetrics: PerformanceMetrics = {
    fps: 0,
    inferenceTime: 0,
    preprocessTime: 0,
    postprocessTime: 0,
    memoryUsage: 0,
  };

  constructor(config: PoseDetectorConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Set backend
      if (this.config.enableGPU) {
        await tf.setBackend('webgl');
      } else {
        await tf.setBackend('cpu');
      }

      // Load model
      this.model = await tf.loadGraphModel(this.config.modelPath);
      
      // Warm up the model
      await this.warmupModel();
    } catch (error) {
      throw new Error(`Failed to initialize pose detector: ${error}`);
    }
  }

  private async warmupModel(): Promise<void> {
    if (!this.model) return;

    const dummyInput = tf.zeros([1, DEFAULT_CONFIG.inputSize.height, DEFAULT_CONFIG.inputSize.width, 3]);
    const prediction = await this.model.predict(dummyInput) as tf.Tensor;
    prediction.dispose();
    dummyInput.dispose();
  }

  async detectPose(imageData: tf.Tensor3D | ImageData | HTMLImageElement | HTMLVideoElement): Promise<Pose | null> {
    if (!this.model) {
      throw new Error('Model not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    
    try {
      // Preprocess
      const preprocessStart = Date.now();
      const input = await this.preprocessImage(imageData);
      this.performanceMetrics.preprocessTime = Date.now() - preprocessStart;

      // Inference
      const inferenceStart = Date.now();
      const output = await this.model.predict(input) as tf.Tensor;
      this.performanceMetrics.inferenceTime = Date.now() - inferenceStart;

      // Postprocess
      const postprocessStart = Date.now();
      const heatmaps = await output.array() as number[][][][];
      const keypoints = extractKeypoints(heatmaps[0]);
      const score = calculatePoseScore(keypoints);
      this.performanceMetrics.postprocessTime = Date.now() - postprocessStart;

      // Cleanup
      input.dispose();
      output.dispose();

      // Update metrics
      const totalTime = Date.now() - startTime;
      this.performanceMetrics.fps = 1000 / totalTime;
      this.lastInferenceTime = totalTime;

      if (score < this.config.minPoseConfidence) {
        return null;
      }

      return {
        keypoints,
        score,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }

  private async preprocessImage(imageData: tf.Tensor3D | ImageData | HTMLImageElement | HTMLVideoElement): Promise<tf.Tensor4D> {
    let tensor: tf.Tensor3D;

    if (imageData instanceof tf.Tensor) {
      tensor = imageData;
    } else {
      tensor = tf.browser.fromPixels(imageData);
    }

    // Resize to model input size
    const resized = tf.image.resizeBilinear(
      tensor,
      [DEFAULT_CONFIG.inputSize.height, DEFAULT_CONFIG.inputSize.width]
    );

    // Normalize to [0, 1]
    const normalized = tf.div(resized, 255.0);

    // Add batch dimension
    const batched = tf.expandDims(normalized, 0);

    // Cleanup intermediate tensors
    if (tensor !== imageData) {
      tensor.dispose();
    }
    resized.dispose();
    normalized.dispose();

    return batched as tf.Tensor4D;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  setTargetFPS(fps: number): void {
    this.config.targetFPS = Math.max(1, Math.min(30, fps));
  }

  async dispose(): Promise<void> {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }

  isInitialized(): boolean {
    return this.model !== null;
  }
}