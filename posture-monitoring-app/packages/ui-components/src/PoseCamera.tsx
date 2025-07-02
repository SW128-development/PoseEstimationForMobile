import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { PoseDetector, Pose } from '@posture-monitor/pose-detection';
import { PoseCameraProps } from './types';
import { PostureVisualization } from './PostureVisualization';

const TensorCamera = cameraWithTensors(Camera);

export const PoseCamera: React.FC<PoseCameraProps> = ({
  onPoseDetected,
  onError,
  modelPath,
  showVisualization = true,
  targetFPS = 20,
  style
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [currentPose, setCurrentPose] = useState<Pose | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const detectorRef = useRef<PoseDetector | null>(null);
  const frameCountRef = useRef(0);
  const lastProcessTimeRef = useRef(0);

  useEffect(() => {
    (async () => {
      // Request camera permission
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Initialize TensorFlow
      await tf.ready();

      // Initialize pose detector
      try {
        const detector = new PoseDetector({
          modelPath,
          modelType: 'cpm',
          targetFPS,
          enableGPU: true
        });

        await detector.initialize();
        detectorRef.current = detector;
        setIsModelReady(true);
      } catch (error) {
        onError?.(error as Error);
      }
    })();

    return () => {
      detectorRef.current?.dispose();
    };
  }, [modelPath, targetFPS, onError]);

  const processImage = useCallback(async (images: any, updatePreview: () => void, gl: any) => {
    const loop = async () => {
      if (!detectorRef.current || !isModelReady) return;

      // Frame rate limiting
      const now = Date.now();
      const timeSinceLastProcess = now - lastProcessTimeRef.current;
      
      if (timeSinceLastProcess < 1000 / targetFPS) {
        requestAnimationFrame(loop);
        return;
      }

      frameCountRef.current += 1;

      try {
        const imageTensor = images.next().value;
        if (imageTensor) {
          const pose = await detectorRef.current.detectPose(imageTensor);
          
          if (pose) {
            setCurrentPose(pose);
            onPoseDetected(pose);
          }

          lastProcessTimeRef.current = now;
        }
      } catch (error) {
        console.error('Error processing frame:', error);
        onError?.(error as Error);
      }

      requestAnimationFrame(loop);
    };

    loop();
  }, [isModelReady, targetFPS, onPoseDetected, onError]);

  if (hasPermission === null) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  if (!isModelReady) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>Loading pose detection model...</Text>
      </View>
    );
  }

  const textureDims = Platform.OS === 'ios' 
    ? { height: 1920, width: 1080 }
    : { height: 1200, width: 1600 };

  return (
    <View style={[styles.container, style]}>
      <TensorCamera
        style={styles.camera}
        type={cameraType}
        resizeHeight={192}
        resizeWidth={192}
        resizeDepth={3}
        onReady={processImage}
        renderToHardwareTextureAndroid
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        autorender={true}
      />
      {showVisualization && currentPose && (
        <PostureVisualization
          pose={currentPose}
          imageSize={{ width: 192, height: 192 }}
          viewSize={{ 
            width: style?.width || styles.camera.width, 
            height: style?.height || styles.camera.height 
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});