# Integration Guide

This guide provides step-by-step instructions for integrating pose estimation into React Native and Expo applications.

## Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`) or React Native CLI
- Python 3.7+ (for model conversion)
- TensorFlow 2.x (for model conversion)

## Step 1: Project Setup

### For Expo Projects

```bash
# Create new Expo project
npx create-expo-app PoseEstimationApp
cd PoseEstimationApp

# Install required dependencies
npx expo install expo-camera expo-gl expo-gl-cpp
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow/tfjs-platform-react-native
npm install react-native-svg
```

### For React Native CLI Projects

```bash
# Create new React Native project
npx react-native init PoseEstimationApp
cd PoseEstimationApp

# Install dependencies
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow/tfjs-platform-react-native
npm install react-native-camera react-native-svg

# iOS additional setup
cd ios && pod install && cd ..
```

## Step 2: Model Conversion

Convert the original TensorFlow models to TensorFlow.js format using the provided script:

```bash
# Convert CPM model
python scripts/convert-model.py \
  --input ../release/cpm_model/model.pb \
  --output ./assets/models/cpm/ \
  --output_node "Convolutional_Pose_Machine/stage_5_out"

# Convert Hourglass model
python scripts/convert-model.py \
  --input ../release/hourglass_model/model.pb \
  --output ./assets/models/hourglass/ \
  --output_node "hourglass_out_3"
```

## Step 3: Basic Implementation

### Import Components

```typescript
import { PoseEstimationCamera, PoseVisualization } from './src/components';
import { Pose } from './src/types';
```

### Main App Component

```typescript
export default function App() {
  const [pose, setPose] = useState<Pose | null>(null);

  const handlePoseDetected = (detectedPose: Pose) => {
    setPose(detectedPose);
  };

  return (
    <View style={styles.container}>
      <PoseEstimationCamera
        modelPath="./assets/models/cpm/model.json"
        onPoseDetected={handlePoseDetected}
        style={styles.camera}
      />
      <PoseVisualization
        pose={pose}
        imageSize={{ width: 192, height: 192 }}
        viewSize={{ width: 300, height: 400 }}
      />
    </View>
  );
}
```

## Step 4: Advanced Features

### Custom Visualization

```typescript
const customConfig = {
  showKeypoints: true,
  showSkeleton: true,
  confidenceThreshold: 0.5,
  colors: {
    keypoints: ['#FF0000', '#00FF00', '#0000FF', ...],
    skeleton: '#FFFFFF'
  }
};

<PoseVisualization
  pose={pose}
  imageSize={{ width: 192, height: 192 }}
  viewSize={{ width: 300, height: 400 }}
  config={customConfig}
/>
```

### Error Handling

```typescript
const handleError = (error: PoseEstimationError) => {
  console.error('Pose estimation error:', error);
  Alert.alert('Error', error.message);
};

<PoseEstimationCamera
  modelPath="./assets/models/cpm/model.json"
  onPoseDetected={handlePoseDetected}
  onError={handleError}
/>
```

## Step 5: Performance Optimization

### Memory Management

```typescript
useEffect(() => {
  return () => {
    // Cleanup model when component unmounts
    model?.dispose();
  };
}, []);
```

### Adaptive Frame Rate

```typescript
const cameraConfig = {
  width: 640,
  height: 480,
  fps: 20, // Reduce for better performance
  facing: 'back'
};

<PoseEstimationCamera
  modelPath="./assets/models/cpm/model.json"
  onPoseDetected={handlePoseDetected}
  cameraConfig={cameraConfig}
/>
```

## Troubleshooting

### Common Issues

1. **Model Loading Fails**: Ensure model files are in the correct path
2. **Poor Performance**: Try reducing inference frequency or using quantized models
3. **Memory Issues**: Implement proper tensor disposal and memory management
4. **Camera Issues**: Check permissions and device compatibility

### Performance Tips

1. Use quantized models for better performance
2. Implement frame skipping for lower-end devices
3. Monitor memory usage and dispose tensors properly
4. Consider using GPU acceleration when available

## Next Steps

1. **Test on Device**: Run on physical devices for accurate performance testing
2. **Optimize Models**: Experiment with quantization and pruning
3. **Add Features**: Implement gesture recognition, pose classification
4. **Error Handling**: Add robust error handling and fallbacks
5. **UI/UX**: Create intuitive user interface and controls
