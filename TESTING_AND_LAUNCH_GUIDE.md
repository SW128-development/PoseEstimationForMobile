# Testing and Launch Guide

## ⚠️ IMPORTANT NOTICE

**This application requires several setup steps before it can be tested and launched. Please read this entire guide before attempting to run the application.**

## Prerequisites

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher  
- **Git**: For version control
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **Platform-specific tools**:
  - **iOS**: Xcode (Mac only) and iOS Simulator
  - **Android**: Android Studio and Android Emulator

### Required Accounts
- **Expo Account**: Sign up at https://expo.dev
- **Apple Developer Account**: For iOS deployment ($99/year)
- **Google Play Console Account**: For Android deployment ($25 one-time)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone [repository-url]
cd PoseEstimationForMobile

# Install root dependencies
npm install

# Install all package dependencies
cd posture-monitoring-app
npm install

# Build all packages
npm run build
```

### 2. Model Files Setup ⚠️ CRITICAL

**The application will NOT work without the ML model files!**

```bash
# Copy model files to the mobile app
cp -r release/cpm_model/* apps/mobile/assets/models/cpm/
cp -r release/hourglass_model/* apps/mobile/assets/models/hourglass/

# Ensure the following files exist:
# - apps/mobile/assets/models/cpm/model.json
# - apps/mobile/assets/models/cpm/model.pb (or weight files)
# - apps/mobile/assets/models/hourglass/model.json
# - apps/mobile/assets/models/hourglass/model.pb (or weight files)
```

### 3. Environment Configuration

Create `.env` file in `apps/mobile/`:

```env
# API Configuration (if using cloud features)
API_ENDPOINT=https://your-api-endpoint.com
API_KEY=your-api-key

# Analytics (optional)
SENTRY_DSN=your-sentry-dsn
AMPLITUDE_API_KEY=your-amplitude-key

# Feature Flags
ENABLE_CLOUD_SYNC=false
ENABLE_ANALYTICS=false
```

## Testing Guide

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests for specific package
npm test -- packages/pose-detection

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Test specific integration
npm run test:integration -- --testNamePattern="Pose Detection"
```

### E2E Tests (Mobile)

```bash
# Install Detox (for React Native E2E testing)
npm install -g detox-cli

# Build for E2E testing
detox build -c ios.sim.debug

# Run E2E tests
detox test -c ios.sim.debug
```

### Manual Testing Checklist

#### 1. Camera Permissions
- [ ] App requests camera permission on first launch
- [ ] App handles permission denial gracefully
- [ ] Settings link works when permission is denied

#### 2. Pose Detection
- [ ] Camera preview displays correctly
- [ ] Pose keypoints are detected and displayed
- [ ] Frame rate is acceptable (>15 FPS)
- [ ] No memory leaks during extended use

#### 3. Posture Analysis
- [ ] Posture score updates in real-time
- [ ] Score reflects actual posture quality
- [ ] Component scores are accurate

#### 4. Alerts
- [ ] Alerts appear for poor posture
- [ ] Alert severity matches issue severity
- [ ] Alerts can be dismissed
- [ ] Auto-hide works for non-severe alerts

#### 5. Performance
- [ ] App remains responsive during pose detection
- [ ] Battery drain is reasonable
- [ ] App handles backgrounding correctly

## Launch Instructions

### Development Launch

#### Mobile (Expo)

```bash
cd apps/mobile

# Start Expo development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Run on physical device
# 1. Install Expo Go app on your device
# 2. Scan QR code from terminal with Expo Go
```

#### Common Issues and Solutions

**Issue: "Unable to resolve module" error**
```bash
# Clear metro cache
npx react-native start --reset-cache

# Clear watchman
watchman watch-del-all
```

**Issue: "Model file not found"**
```bash
# Ensure model files are in correct location
ls -la apps/mobile/assets/models/cpm/
# Should show model.json and weight files
```

**Issue: iOS Simulator not launching**
```bash
# Open Xcode and accept licenses
sudo xcode-select --switch /Applications/Xcode.app
sudo xcodebuild -license accept
```

### Production Build

#### iOS Production Build

```bash
# Configure app.json with your bundle identifier
# Update ios.bundleIdentifier in app.json

# Build for App Store
expo build:ios -t archive

# Download .ipa file when ready
# Upload to App Store Connect via Transporter
```

#### Android Production Build

```bash
# Configure app.json with your package name
# Update android.package in app.json

# Build APK
expo build:android -t apk

# Build App Bundle (recommended for Play Store)
expo build:android -t app-bundle

# Download .aab/.apk file when ready
```

### Web Deployment

```bash
cd apps/web

# Build for production
npm run build

# Test production build locally
npx serve -s build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=build
```

### Desktop Deployment

```bash
cd apps/desktop

# Build for current platform
npm run dist

# Build for all platforms
npm run dist-all

# Output locations:
# - Windows: dist/Posture Monitor Setup {version}.exe
# - macOS: dist/Posture Monitor-{version}.dmg
# - Linux: dist/posture-monitor-{version}.AppImage
```

## Performance Testing

### Load Testing

```bash
# Run performance benchmarks
npm run benchmark

# Expected results:
# - Pose detection: < 50ms per frame
# - Posture analysis: < 10ms per frame
# - UI render: < 16ms per frame
```

### Memory Profiling

```javascript
// Add to app for memory monitoring
if (__DEV__) {
  setInterval(() => {
    const usage = performance.memory;
    console.log('Memory:', {
      used: Math.round(usage.usedJSHeapSize / 1048576) + 'MB',
      total: Math.round(usage.totalJSHeapSize / 1048576) + 'MB'
    });
  }, 5000);
}
```

## Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Accessibility testing done
- [ ] Privacy policy updated
- [ ] Terms of service ready

### App Store Submission

- [ ] App icons (all sizes)
- [ ] Screenshots (all device sizes)
- [ ] App description
- [ ] Keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing materials

### Post-deployment

- [ ] Monitor crash reports
- [ ] Track user analytics
- [ ] Respond to user feedback
- [ ] Plan next iteration

## Troubleshooting

### Common Problems

1. **TensorFlow.js not initializing**
   - Ensure @tensorflow/tfjs-react-native is installed
   - Call `tf.ready()` before using any TF operations

2. **Camera not working**
   - Check permissions in device settings
   - Ensure Expo Camera is properly installed
   - Try reinstalling node_modules

3. **Low FPS on Android**
   - Enable GPU delegate in pose detection config
   - Reduce camera resolution
   - Enable frame skipping

4. **Model loading errors**
   - Verify model files exist in assets
   - Check model.json references correct weight files
   - Ensure file paths are correct for platform

## Support Resources

- **Documentation**: See `/docs` folder
- **Issue Tracking**: GitHub Issues
- **Community Forum**: [forum-link]
- **Email Support**: support@posturemonitor.app

## Important Security Notes

1. **Never commit**:
   - API keys
   - Private certificates
   - User data

2. **Always use**:
   - HTTPS for API calls
   - Encrypted storage for sensitive data
   - Proper permission checks

3. **Regular updates**:
   - Keep dependencies updated
   - Monitor security advisories
   - Patch vulnerabilities promptly

## Final Launch Readiness Checklist

- [ ] ✅ All features working as expected
- [ ] ✅ Performance meets targets
- [ ] ✅ No critical bugs
- [ ] ✅ Security measures in place
- [ ] ✅ Documentation complete
- [ ] ✅ Support system ready
- [ ] ✅ Monitoring configured
- [ ] ✅ Backup plan prepared

**Remember**: Always test on real devices before deployment!