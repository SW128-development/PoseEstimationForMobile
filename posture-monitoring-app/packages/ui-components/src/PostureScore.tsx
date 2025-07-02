import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PostureScoreProps } from './types';

export const PostureScore: React.FC<PostureScoreProps> = ({
  score,
  showComponents = true,
  animated = true,
  theme
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const previousScore = useRef(0);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: score.overall,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(score.overall);
    }
    previousScore.current = score.overall;
  }, [score.overall, animated]);

  const colors = theme?.colors || {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    text: '#000000',
    primary: '#2196F3',
  };

  const getScoreColor = (value: number) => {
    if (value >= 80) return colors.success;
    if (value >= 60) return colors.warning;
    return colors.error;
  };

  const interpolatedScore = animated
    ? animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0', '100'],
      })
    : score.overall.toString();

  return (
    <View style={styles.container}>
      <View style={styles.mainScore}>
        <Animated.Text style={[styles.scoreValue, { color: getScoreColor(score.overall) }]}>
          {animated ? interpolatedScore : score.overall}
        </Animated.Text>
        <Text style={[styles.scoreLabel, { color: colors.text }]}>Posture Score</Text>
      </View>

      {showComponents && (
        <View style={styles.components}>
          {Object.entries(score.components).map(([key, value]) => (
            <View key={key} style={styles.component}>
              <Text style={[styles.componentLabel, { color: colors.text }]}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${value}%`,
                      backgroundColor: getScoreColor(value),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.componentValue, { color: colors.text }]}>{value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    marginTop: 8,
  },
  components: {
    marginTop: 10,
  },
  component: {
    marginBottom: 12,
  },
  componentLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  componentValue: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
});