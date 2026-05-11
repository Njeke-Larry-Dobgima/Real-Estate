/**
 * Error Boundary Component
 * Catches and displays errors gracefully
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontSizes, BorderRadius, Spacing, Shadows } from '../../constants/colors';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and display errors
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We encountered an unexpected error. Please try again.
            </Text>
            {this.state.error && (
              <Text style={styles.errorDetail} numberOfLines={3}>
                {this.state.error.message}
              </Text>
            )}
            <Pressable style={styles.button} onPress={this.handleReset}>
              <Ionicons name="refresh" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  errorDetail: {
    fontSize: FontSizes.caption,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.errorLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.small,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.card,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});

export default ErrorBoundary;
