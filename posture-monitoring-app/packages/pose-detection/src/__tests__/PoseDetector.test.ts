import * as tf from '@tensorflow/tfjs';
import { PoseDetector } from '../PoseDetector';
import { Pose } from '../types';

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(true),
  setBackend: jest.fn().mockResolvedValue(true),
  loadGraphModel: jest.fn().mockResolvedValue({
    predict: jest.fn(),
    dispose: jest.fn(),
  }),
  zeros: jest.fn().mockReturnValue({
    dispose: jest.fn(),
  }),
  browser: {
    fromPixels: jest.fn().mockReturnValue({
      dispose: jest.fn(),
    }),
  },
  image: {
    resizeBilinear: jest.fn().mockReturnValue({
      dispose: jest.fn(),
    }),
  },
  div: jest.fn().mockReturnValue({
    dispose: jest.fn(),
  }),
  expandDims: jest.fn().mockReturnValue({
    dispose: jest.fn(),
  }),
}));

describe('PoseDetector', () => {
  let detector: PoseDetector;

  beforeEach(() => {
    jest.clearAllMocks();
    detector = new PoseDetector({
      modelPath: './test-model.json',
      modelType: 'cpm',
      targetFPS: 20,
      minPoseConfidence: 0.3,
      enableGPU: true,
    });
  });

  afterEach(async () => {
    await detector.dispose();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(detector.initialize()).resolves.not.toThrow();
      expect(tf.ready).toHaveBeenCalled();
      expect(tf.setBackend).toHaveBeenCalledWith('webgl');
      expect(tf.loadGraphModel).toHaveBeenCalledWith('./test-model.json');
    });

    it('should use CPU backend when GPU is disabled', async () => {
      const cpuDetector = new PoseDetector({
        modelPath: './test-model.json',
        modelType: 'cpm',
        enableGPU: false,
      });

      await cpuDetector.initialize();
      expect(tf.setBackend).toHaveBeenCalledWith('cpu');
      await cpuDetector.dispose();
    });

    it('should throw error if model loading fails', async () => {
      (tf.loadGraphModel as jest.Mock).mockRejectedValueOnce(new Error('Model not found'));

      await expect(detector.initialize()).rejects.toThrow('Failed to initialize pose detector');
    });
  });

  describe('pose detection', () => {
    beforeEach(async () => {
      const mockModel = {
        predict: jest.fn().mockReturnValue({
          array: jest.fn().mockResolvedValue([[[[0.5, 0.6, 0.7]]]]),
          dispose: jest.fn(),
        }),
        dispose: jest.fn(),
      };

      (tf.loadGraphModel as jest.Mock).mockResolvedValue(mockModel);
      await detector.initialize();
    });

    it('should detect pose from valid image data', async () => {
      const mockImageData = new ImageData(192, 192);
      const pose = await detector.detectPose(mockImageData);

      expect(pose).toBeDefined();
      expect(pose?.keypoints).toHaveLength(14);
      expect(pose?.score).toBeGreaterThan(0);
      expect(pose?.timestamp).toBeDefined();
    });

    it('should return null for low confidence poses', async () => {
      const mockModel = {
        predict: jest.fn().mockReturnValue({
          array: jest.fn().mockResolvedValue([[[[0.1, 0.1, 0.1]]]]),
          dispose: jest.fn(),
        }),
        dispose: jest.fn(),
      };

      (tf.loadGraphModel as jest.Mock).mockResolvedValue(mockModel);
      
      const lowConfidenceDetector = new PoseDetector({
        modelPath: './test-model.json',
        modelType: 'cpm',
        minPoseConfidence: 0.8,
      });

      await lowConfidenceDetector.initialize();
      const pose = await lowConfidenceDetector.detectPose(new ImageData(192, 192));

      expect(pose).toBeNull();
      await lowConfidenceDetector.dispose();
    });

    it('should throw error if not initialized', async () => {
      const uninitializedDetector = new PoseDetector({
        modelPath: './test-model.json',
        modelType: 'cpm',
      });

      await expect(uninitializedDetector.detectPose(new ImageData(192, 192)))
        .rejects.toThrow('Model not initialized');
    });
  });

  describe('performance metrics', () => {
    it('should track performance metrics', async () => {
      await detector.initialize();
      const metrics = detector.getPerformanceMetrics();

      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('inferenceTime');
      expect(metrics).toHaveProperty('preprocessTime');
      expect(metrics).toHaveProperty('postprocessTime');
      expect(metrics).toHaveProperty('memoryUsage');
    });
  });

  describe('target FPS', () => {
    it('should set target FPS within valid range', () => {
      detector.setTargetFPS(25);
      expect(detector['config'].targetFPS).toBe(25);

      detector.setTargetFPS(0);
      expect(detector['config'].targetFPS).toBe(1);

      detector.setTargetFPS(100);
      expect(detector['config'].targetFPS).toBe(30);
    });
  });

  describe('disposal', () => {
    it('should dispose model properly', async () => {
      const mockModel = {
        predict: jest.fn(),
        dispose: jest.fn(),
      };

      (tf.loadGraphModel as jest.Mock).mockResolvedValue(mockModel);
      await detector.initialize();
      await detector.dispose();

      expect(mockModel.dispose).toHaveBeenCalled();
      expect(detector.isInitialized()).toBe(false);
    });
  });
});