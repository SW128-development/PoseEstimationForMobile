import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, StatusBar } from 'react-native';
import { Camera } from 'expo-camera';
import { PoseEstimationCamera, PoseVisualization } from '../../src/components/PoseEstimationCamera';
import { Pose } from '../../src/types';

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [pose, setPose] = useState<Pose | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestCameraPermissions();
  }, []);

  const requestCameraPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to perform pose estimation.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to request camera permissions:', error);
      setError('Failed to request camera permissions');
    }
  };

  const handlePoseDetected = (detectedPose: Pose) => {
    setPose(detectedPose);
    setIsLoading(false);
  };

  const handleError = (poseError: Error) => {
    console.error('Pose estimation error:', poseError);
    setError(poseError.message);
    setIsLoading(false);
  };

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.loadingText}>Loading pose estimation model...</Text>
    </View>
  );

  const renderPermissionDenied = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>Camera permission is required</Text>
      <Text style={styles.subText}>Please enable camera access in settings</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>Error: {error}</Text>
      <Text style={styles.subText}>Please restart the app</Text>
    </View>
  );

  if (hasPermission === null) {
    return renderLoadingState();
  }

  if (hasPermission === false) {
    return renderPermissionDenied();
  }

  if (error) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Camera with pose estimation */}
      <PoseEstimationCamera
        modelPath="./assets/models/cpm/model.json"
        onPoseDetected={handlePoseDetected}
        onError={handleError}
        style={styles.camera}
      />
      
      {/* Pose visualization overlay */}
      {pose && (
        <PoseVisualization
          pose={pose}
          imageSize={{ width: 192, height: 192 }}
          viewSize={{ width: 300, height: 400 }}
          style={styles.overlay}
        />
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      )}
      
      {/* Pose confidence indicator */}
      {pose && (
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceText}>
            Confidence: {(pose.confidence * 100).toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
  confidenceContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
