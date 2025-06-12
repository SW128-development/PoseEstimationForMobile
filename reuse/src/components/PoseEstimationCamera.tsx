import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import { PoseEstimationModel } from '../models/PoseEstimationModel';
import { 
  Pose, 
  CameraConfig, 
  DEFAULT_CAMERA_CONFIG,
  PoseEstimationCameraProps,
  CameraError,
  InferenceError 
} from '../types';

const TensorCamera = cameraWithTensors(Camera);

export const PoseEstimationCamera: React.FC<PoseEstimationCameraProps> = ({
  modelPath,
  onPoseDetected,
  onError,
  cameraConfig = {},
  style
}) => {
  const [model, setModel] = useState<PoseEstimationModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const frameCount = useRef(0);
  const lastInferenceTime = useRef(0);
  const isProcessing = useRef(false);
  
  const config: CameraConfig = { ...DEFAULT_CAMERA_CONFIG, ...cameraConfig };
  const INFERENCE_INTERVAL = 1000 / 20; // 20 FPS target

  // Initialize camera permissions and model
  useEffect(() => {
    initializeCamera();
    initializeModel();
    
    return () => {
      model?.dispose();
    };
  }, [modelPath]);

  const initializeCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        const error = new CameraError('Camera permission denied');
        onError?.(error);
      }
    } catch (error) {
      const cameraError = new CameraError(`Failed to request camera permission: ${error.message}`);
      onError?.(cameraError);
    }
  };

  const initializeModel = async () => {
    try {
      setIsModelLoading(true);
      const poseModel = new PoseEstimationModel();
      await poseModel.loadModel(modelPath);
      setModel(poseModel);
    } catch (error) {
      onError?.(error);
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleCameraStream = (images: IterableIterator<tf.Tensor3D>) => {
    const loop = async () => {
      const nextImageTensor = images.next().value;
      
      if (nextImageTensor && model && !isProcessing.current) {
        frameCount.current++;
        const now = Date.now();
        
        // Throttle inference to maintain performance
        if (now - lastInferenceTime.current > INFERENCE_INTERVAL) {
          isProcessing.current = true;
          
          try {
            const pose = await model.predict(nextImageTensor);
            onPoseDetected(pose);
            lastInferenceTime.current = now;
          } catch (error) {
            const inferenceError = new InferenceError(`Pose detection failed: ${error.message}`);
            onError?.(inferenceError);
          } finally {
            isProcessing.current = false;
          }
        }
        
        // Always dispose the tensor to prevent memory leaks
        nextImageTensor.dispose();
      }
      
      requestAnimationFrame(loop);
    };
    loop();
  };

  // Handle camera errors
  const handleCameraError = (error: any) => {
    console.error('Camera error:', error);
    const cameraError = new CameraError(`Camera error: ${error.message || 'Unknown error'}`);
    onError?.(cameraError);
  };

  // Show loading/error states
  if (hasPermission === null || isModelLoading || !model) {
    return <View style={[styles.container, styles.centered, style]} />;
  }

  if (hasPermission === false) {
    return <View style={[styles.container, styles.centered, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <TensorCamera
        style={styles.camera}
        type={config.facing === 'front' ? Camera.Constants.Type.front : Camera.Constants.Type.back}
        onReady={handleCameraStream}
        onError={handleCameraError}
        autorender={true}
        useCustomShadersToResize={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
