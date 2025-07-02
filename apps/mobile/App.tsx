import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import { Pose } from '@posture-monitor/pose-detection';
import { PostureAnalyzer, PostureMetrics } from '@posture-monitor/posture-analysis';
import { PoseCamera, PostureScore, AlertBanner } from '@posture-monitor/ui-components';

const Stack = createStackNavigator();

// Home Screen
const HomeScreen = ({ navigation }: any) => {
  const [tfReady, setTfReady] = useState(false);

  useEffect(() => {
    tf.ready().then(() => {
      setTfReady(true);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.homeContainer}>
        <Text style={styles.title}>Posture Monitor</Text>
        <Text style={styles.subtitle}>Monitor and improve your posture</Text>
        
        {!tfReady ? (
          <Text style={styles.loadingText}>Initializing TensorFlow.js...</Text>
        ) : (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Monitor')}
            >
              <Text style={styles.buttonText}>Start Monitoring</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Calibration')}
            >
              <Text style={styles.buttonText}>Calibrate Posture</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Text style={styles.buttonText}>View Analytics</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

// Monitoring Screen
const MonitoringScreen = () => {
  const [postureMetrics, setPostureMetrics] = useState<PostureMetrics | null>(null);
  const [analyzer] = useState(() => new PostureAnalyzer());

  const handlePoseDetected = (pose: Pose) => {
    const metrics = analyzer.analyzePose(pose);
    setPostureMetrics(metrics);
  };

  return (
    <View style={styles.container}>
      <PoseCamera
        modelPath="./assets/models/cpm/model.json"
        onPoseDetected={handlePoseDetected}
        style={styles.camera}
      />
      
      {postureMetrics && (
        <>
          <View style={styles.scoreOverlay}>
            <PostureScore
              score={postureMetrics.currentPosture}
              showComponents={false}
              animated={true}
            />
          </View>
          
          <AlertBanner
            issues={postureMetrics.issues}
            autoHideDuration={5000}
          />
        </>
      )}
    </View>
  );
};

// Calibration Screen (placeholder)
const CalibrationScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Calibration</Text>
        <Text style={styles.subtitle}>
          Sit or stand in your ideal posture for 30 seconds
        </Text>
        {/* Calibration implementation would go here */}
      </View>
    </SafeAreaView>
  );
};

// Analytics Screen (placeholder)
const AnalyticsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Your posture history and trends</Text>
        {/* Analytics charts would go here */}
      </View>
    </SafeAreaView>
  );
};

// Main App Component
export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Monitor" component={MonitoringScreen} />
          <Stack.Screen name="Calibration" component={CalibrationScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
    minWidth: 200,
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
});