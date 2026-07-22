import { useEffect, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '@/constants/motion';

type AnimatedModalVariant = 'sheet' | 'dialog';

interface AnimatedModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: ReactNode;
  variant?: AnimatedModalVariant;
  dismissOnBackdrop?: boolean;
  backdropColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * 네이티브 Modal + 부드러운 떠오름.
 * visible과 Modal을 동기화해 닫힌 뒤 터치가 막히지 않게 한다.
 */
export function AnimatedModal({
  visible,
  onRequestClose,
  children,
  variant = 'sheet',
  dismissOnBackdrop = true,
  backdropColor = 'rgba(44, 36, 22, 0.4)',
  contentStyle,
}: AnimatedModalProps) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: motion.modalMs,
        easing: motion.modalEasing,
      });
      return;
    }

    progress.value = 0;
    const t = setTimeout(() => setMounted(false), 40);
    return () => clearTimeout(t);
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.96,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + progress.value * 0.3,
    transform: [{ translateY: (1 - progress.value) * motion.sheetTravel }],
  }));

  const dialogStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * motion.dialogTravel }],
  }));

  if (!mounted && !visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onRequestClose}>
      <View
        style={[
          styles.root,
          variant === 'sheet' ? styles.rootSheet : styles.rootDialog,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.backdrop, { backgroundColor: backdropColor }, backdropStyle]}
        />
        {dismissOnBackdrop ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose} />
        ) : null}
        <Animated.View
          style={[
            variant === 'sheet' ? styles.sheetWrap : styles.dialogWrap,
            variant === 'sheet' ? sheetStyle : dialogStyle,
            contentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootSheet: {
    justifyContent: 'flex-end',
  },
  rootDialog: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetWrap: {
    width: '100%',
  },
  dialogWrap: {
    width: '100%',
    maxWidth: 340,
  },
});

export function usePressScale(pressedScale = 0.97) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(pressedScale, {
      damping: motion.pressDamping,
      stiffness: motion.pressStiffness,
    });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, {
      damping: motion.pressDamping + 2,
      stiffness: motion.pressStiffness - 20,
    });
  };

  return { animatedStyle, onPressIn, onPressOut };
}
