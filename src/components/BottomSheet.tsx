import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { palette } from "../theme";

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.9;

const SheetScrollContext = createContext<(offsetY: number) => void>(() => undefined);

type Props = {
  visible: boolean;
  onClose: () => void;
  closeLabel: string;
  sheetStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, closeLabel, sheetStyle, children }: Props): React.JSX.Element {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const [mounted, setMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(windowHeight);
  const sheetHeightRef = useRef(windowHeight);
  const scrollOffset = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // Keep the last visible content on screen while the sheet animates out.
  const lastChildren = useRef(children);
  if (visible) lastChildren.current = children;

  useEffect(() => {
    if (visible) {
      scrollOffset.current = 0;
      setMounted(true);
      translateY.setValue(windowHeight);
      Animated.timing(translateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      Animated.timing(translateY, { toValue: sheetHeightRef.current, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { if (finished) setMounted(false); });
    }
  }, [visible]);

  const dismiss = useMemo(() => () => {
    Animated.timing(translateY, { toValue: sheetHeightRef.current, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true })
      .start(() => onCloseRef.current());
  }, [translateY]);

  const panResponder = useMemo(() => {
    const settle = (): void => {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 16 }).start();
    };
    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.2 && scrollOffset.current <= 0,
      onPanResponderMove: (_, gesture) => translateY.setValue(Math.max(0, gesture.dy)),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) dismiss();
        else settle();
      },
      onPanResponderTerminate: settle,
      onPanResponderTerminationRequest: () => false
    });
  }, [dismiss, translateY]);

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, Math.max(1, sheetHeight)],
    outputRange: [1, 0],
    extrapolate: "clamp"
  });

  return (
    <Modal animationType="none" onRequestClose={dismiss} statusBarTranslucent transparent visible={mounted}>
      <View style={styles.overlay}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
        <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={dismiss} style={styles.fill} />
        <Animated.View
          accessibilityViewIsModal
          onLayout={(event) => {
            sheetHeightRef.current = event.nativeEvent.layout.height;
            setSheetHeight(event.nativeEvent.layout.height);
          }}
          style={[styles.sheet, sheetStyle, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
          <SheetScrollContext.Provider value={(offsetY) => { scrollOffset.current = offsetY; }}>
            {visible ? children : lastChildren.current}
          </SheetScrollContext.Provider>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** ScrollView that lets the parent BottomSheet take over a downward drag when scrolled to the top. */
export function SheetScrollView({ onScroll, ...props }: ScrollViewProps): React.JSX.Element {
  const reportOffset = useContext(SheetScrollContext);
  return (
    <ScrollView
      bounces={false}
      overScrollMode="never"
      scrollEventThrottle={16}
      {...props}
      onScroll={(event) => {
        reportOffset(event.nativeEvent.contentOffset.y);
        onScroll?.(event);
      }}
    />
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  fill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(25, 32, 26, 0.42)" },
  sheet: { backgroundColor: palette.paper, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#D6D9D0", alignSelf: "center", marginBottom: 16 }
});
