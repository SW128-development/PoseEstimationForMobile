import { Pose } from '@posture-monitor/pose-detection';
import { PostureScore, PostureIssue } from '@posture-monitor/posture-analysis';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    body: TextStyle;
    caption: TextStyle;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

export interface TextStyle {
  fontSize: number;
  fontWeight?: string;
  lineHeight?: number;
  letterSpacing?: number;
}

export interface ViewSize {
  width: number;
  height: number;
}

export interface PoseCameraProps {
  onPoseDetected: (pose: Pose) => void;
  onError?: (error: Error) => void;
  modelPath: string;
  showVisualization?: boolean;
  targetFPS?: number;
  style?: any;
}

export interface PostureVisualizationProps {
  pose: Pose | null;
  imageSize: ViewSize;
  viewSize: ViewSize;
  showSkeleton?: boolean;
  showKeypoints?: boolean;
  keypointRadius?: number;
  skeletonWidth?: number;
  theme?: Theme;
}

export interface PostureScoreProps {
  score: PostureScore;
  showComponents?: boolean;
  animated?: boolean;
  theme?: Theme;
}

export interface AlertBannerProps {
  issues: PostureIssue[];
  onDismiss?: (issueId: string) => void;
  autoHideDuration?: number;
  theme?: Theme;
}

export interface CalibrationScreenProps {
  onCalibrationComplete: (baseline: any) => void;
  onCancel: () => void;
  instructions?: string[];
  theme?: Theme;
}

export interface AnalyticsChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  title?: string;
  showLegend?: boolean;
  theme?: Theme;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}