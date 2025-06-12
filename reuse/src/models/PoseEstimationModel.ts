import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { 
  Keypoint, 
  Pose, 
  ModelConfig, 
  DEFAULT_MODEL_CONFIG,
  ModelLoadError,
  InferenceError 
} from '../types';

export class PoseEstimationModel {
  private model: tf.GraphModel | null = null;
  private isLoaded = false;
  private config: ModelConfig;

  constructor(config: Partial<ModelConfig> = {}) {
    this.config = { ...DEFAULT_MODEL_CONFIG, ...config };
  }

  async loadModel(modelPath: string): Promise<void> {
    try {
      console.log('Initializing TensorFlow.js...');
      await tf.ready();
      
      // Set optimal backend
      await this.setOptimalBackend();
      
      console.log('Loading pose estimation model...');
      this.model = await tf.loadGraphModel(modelPath);
      
      // Warm up the model
      await this.warmUp();
      
      this.isLoaded = true;
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
      throw new ModelLoadError(`Failed to load model: ${error.message}`);
    }
  }

  async predict(imageData: tf.Tensor3D): Promise<Pose> {
    if (!this.model || !this.isLoaded) {
      throw new InferenceError('Model not loaded');
    }

    let resized: tf.Tensor3D | null = null;
    let normalized: tf.Tensor3D | null = null;
    let batched: tf.Tensor4D | null = null;
    let prediction: tf.Tensor4D | null = null;

    try {
      // Preprocess input
      resized = tf.image.resizeBilinear(
        imageData, 
        [this.config.inputSize.height, this.config.inputSize.width]
      );
      normalized = resized.div(255.0);
      batched = normalized.expandDims(0);

      // Run inference
      prediction = this.model.predict(batched) as tf.Tensor4D;

      // Post-process to extract keypoints
      const keypoints = await this.extractKeypoints(prediction);
      
      // Calculate overall pose confidence
      const confidence = this.calculatePoseConfidence(keypoints);

      return {
        keypoints,
        confidence,
      };
    } catch (error) {
      throw new InferenceError(`Inference failed: ${error.message}`);
    } finally {
      // Cleanup tensors
      resized?.dispose();
      normalized?.dispose();
      batched?.dispose();
      prediction?.dispose();
    }
  }

  private async setOptimalBackend(): Promise<void> {
    const backends = ['rn-webgl', 'cpu'];
    
    for (const backend of backends) {
      try {
        await tf.setBackend(backend);
        await tf.ready();
        console.log(`Selected backend: ${backend}`);
        return;
      } catch (error) {
        console.warn(`Backend ${backend} failed:`, error);
      }
    }
    
    console.log('Fallback to CPU backend');
  }

  private async warmUp(): Promise<void> {
    if (!this.model) return;
    
    console.log('Warming up model...');
    const dummyInput = tf.zeros([
      1, 
      this.config.inputSize.height, 
      this.config.inputSize.width, 
      this.config.channels
    ]);
    
    try {
      const warmupPrediction = this.model.predict(dummyInput) as tf.Tensor4D;
      await warmupPrediction.data();
      warmupPrediction.dispose();
    } catch (error) {
      console.warn('Model warmup failed:', error);
    } finally {
      dummyInput.dispose();
    }
  }

  private async extractKeypoints(heatmaps: tf.Tensor4D): Promise<Keypoint[]> {
    let reshaped: tf.Tensor2D | null = null;
    let argMaxIndices: tf.Tensor1D | null = null;
    let maxValues: tf.Tensor1D | null = null;

    try {
      // Reshape for vectorized operations
      reshaped = heatmaps.reshape([
        this.config.outputSize.width * this.config.outputSize.height, 
        this.config.numKeypoints
      ]);
      
      // Find maximum values and indices for all keypoints at once
      argMaxIndices = reshaped.argMax(0);
      maxValues = reshaped.max(0);
      
      const indices = await argMaxIndices.data();
      const values = await maxValues.data();
      
      const keypoints: Keypoint[] = [];
      
      for (let i = 0; i < this.config.numKeypoints; i++) {
        const idx = indices[i];
        const y = Math.floor(idx / this.config.outputSize.width);
        const x = idx % this.config.outputSize.width;
        
        // Scale coordinates back to input size
        const scaleX = this.config.inputSize.width / this.config.outputSize.width;
        const scaleY = this.config.inputSize.height / this.config.outputSize.height;
        
        keypoints.push({
          id: i,
          x: x * scaleX,
          y: y * scaleY,
          confidence: values[i]
        });
      }
      
      return keypoints;
    } finally {
      reshaped?.dispose();
      argMaxIndices?.dispose();
      maxValues?.dispose();
    }
  }

  private calculatePoseConfidence(keypoints: Keypoint[]): number {
    if (keypoints.length === 0) return 0;
    
    const validKeypoints = keypoints.filter(kp => kp.confidence > 0.1);
    if (validKeypoints.length === 0) return 0;
    
    const avgConfidence = validKeypoints.reduce((sum, kp) => sum + kp.confidence, 0) / validKeypoints.length;
    const completeness = validKeypoints.length / keypoints.length;
    
    // Weighted combination of average confidence and completeness
    return avgConfidence * 0.7 + completeness * 0.3;
  }

  getModelInfo(): ModelConfig {
    return { ...this.config };
  }

  isModelLoaded(): boolean {
    return this.isLoaded;
  }

  getMemoryUsage(): tf.MemoryInfo {
    return tf.memory();
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    
    this.isLoaded = false;
    console.log('Model disposed');
  }
}
