# Posture Monitoring App

A comprehensive hybrid application for real-time posture monitoring using computer vision and machine learning. Monitor and improve your posture during work and exercise with cross-platform support for mobile, desktop, and web.

## 🌟 Features

- **Real-time Pose Detection**: Using state-of-the-art ML models (CPM/Hourglass)
- **Posture Analysis**: Intelligent scoring and issue detection
- **Smart Alerts**: Context-aware notifications for poor posture
- **Cross-Platform**: iOS, Android, Web, and Desktop support
- **Privacy-First**: All processing happens locally on your device
- **Personal Calibration**: Customize to your ideal posture
- **Analytics Dashboard**: Track your posture improvement over time

## 📱 Screenshots

| Home Screen | Monitoring | Analytics | Alerts |
|-------------|-----------|-----------|---------|
| ![Home](images/home.png) | ![Monitor](images/monitor.png) | ![Analytics](images/analytics.png) | ![Alerts](images/alerts.png) |

## 🏗️ Architecture

The application follows a modular monorepo architecture:

```
posture-monitoring-app/
├── packages/                    # Shared packages
│   ├── pose-detection/         # Core ML pose detection
│   ├── posture-analysis/       # Posture scoring algorithms
│   ├── ui-components/          # Reusable UI components
│   ├── data-storage/           # Data persistence
│   └── alerts/                 # Alert system
├── apps/                       # Platform applications
│   ├── mobile/                 # React Native app
│   ├── desktop/                # Electron app
│   └── web/                    # React web app
└── docs/                       # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- Expo CLI (`npm install -g expo-cli`)
- Platform-specific tools (Xcode for iOS, Android Studio for Android)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/posture-monitoring-app.git
cd PoseEstimationForMobile
```

2. Install dependencies:
```bash
cd posture-monitoring-app
npm install
```

3. Build packages:
```bash
npm run build
```

4. **Important**: Copy ML model files:
```bash
# Copy the pre-trained models to the app
cp -r release/cpm_model/* apps/mobile/assets/models/cpm/
cp -r release/hourglass_model/* apps/mobile/assets/models/hourglass/
```

5. Start the mobile app:
```bash
cd apps/mobile
npm start
```

## 📖 Documentation

- [Architecture Overview](architecture/POSTURE_MONITORING_ARCHITECTURE.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [Testing & Launch Guide](TESTING_AND_LAUNCH_GUIDE.md)
- [Code Review & Refactoring](CODE_REVIEW_AND_REFACTORING.md)
- [Module Integration Plan](MODULE_INTEGRATION_PLAN.md)

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test with coverage
npm test -- --coverage
```

## 🔧 Configuration

Create a `.env` file in the app directory:

```env
# Optional cloud features
API_ENDPOINT=https://your-api.com
API_KEY=your-api-key

# Analytics (optional)
SENTRY_DSN=your-sentry-dsn

# Feature flags
ENABLE_CLOUD_SYNC=false
ENABLE_ANALYTICS=false
```

## 📱 Platform-Specific Guides

### Mobile (React Native/Expo)

```bash
cd apps/mobile

# iOS
npm run ios

# Android
npm run android

# Web preview
npm run web
```

### Desktop (Electron)

```bash
cd apps/desktop
npm start

# Build installers
npm run dist
```

### Web (React)

```bash
cd apps/web
npm start

# Build for production
npm run build
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original PoseEstimation models from [tucan9389](https://github.com/tucan9389/PoseEstimation-CoreML)
- TensorFlow.js team for the excellent mobile ML framework
- React Native and Expo teams for the cross-platform framework

## 🐛 Known Issues

- Frame rate may be lower on older devices
- Some Android devices may require manual GPU enablement
- Web version requires HTTPS for camera access

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/posture-monitoring-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/posture-monitoring-app/discussions)
- **Email**: support@posturemonitor.app

## 🚦 Status

![Build Status](https://img.shields.io/github/workflow/status/yourusername/posture-monitoring-app/CI)
![Coverage](https://img.shields.io/codecov/c/github/yourusername/posture-monitoring-app)
![License](https://img.shields.io/github/license/yourusername/posture-monitoring-app)
![Version](https://img.shields.io/github/package-json/v/yourusername/posture-monitoring-app)

---

Made with ❤️ by the Posture Monitor Team