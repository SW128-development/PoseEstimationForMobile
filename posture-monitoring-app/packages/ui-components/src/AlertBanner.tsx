import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { PostureIssue, IssueSeverity } from '@posture-monitor/posture-analysis';
import { AlertBannerProps } from './types';

export const AlertBanner: React.FC<AlertBannerProps> = ({
  issues,
  onDismiss,
  autoHideDuration = 5000,
  theme
}) => {
  const [visibleIssues, setVisibleIssues] = useState<PostureIssue[]>([]);
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    if (issues.length > 0) {
      setVisibleIssues(issues);
      
      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide for non-severe issues
      const nonSevereIssues = issues.filter(issue => issue.severity !== IssueSeverity.SEVERE);
      if (nonSevereIssues.length === issues.length && autoHideDuration > 0) {
        const timer = setTimeout(() => {
          handleDismissAll();
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    }
  }, [issues, autoHideDuration]);

  const handleDismissAll = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisibleIssues([]);
    });
  };

  const handleDismissIssue = (issueId: string) => {
    onDismiss?.(issueId);
    const remaining = visibleIssues.filter(issue => issue.id !== issueId);
    if (remaining.length === 0) {
      handleDismissAll();
    } else {
      setVisibleIssues(remaining);
    }
  };

  if (visibleIssues.length === 0) return null;

  const colors = theme?.colors || {
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    text: '#FFFFFF',
    background: '#333333',
  };

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.SEVERE:
        return colors.error;
      case IssueSeverity.MODERATE:
        return colors.warning;
      default:
        return colors.info;
    }
  };

  const mostSevereIssue = visibleIssues.reduce((prev, current) => {
    const severityOrder = { severe: 0, moderate: 1, mild: 2 };
    return severityOrder[prev.severity] <= severityOrder[current.severity] ? prev : current;
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getSeverityColor(mostSevereIssue.severity),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Posture Alert
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {mostSevereIssue.description}
          </Text>
          <Text style={[styles.recommendation, { color: colors.text }]}>
            {mostSevereIssue.recommendation}
          </Text>
          {visibleIssues.length > 1 && (
            <Text style={[styles.additionalIssues, { color: colors.text }]}>
              +{visibleIssues.length - 1} more issues
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => handleDismissIssue(mostSevereIssue.id)}
        >
          <Text style={[styles.dismissText, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40, // Account for status bar
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  recommendation: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  additionalIssues: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  dismissButton: {
    padding: 8,
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});