import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { GestureDetector, GestureHandlerRootView, usePanGesture } from "react-native-gesture-handler";
import { palette } from "../theme";

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.9;
// "firm" sheets resist the pull and need a longer, deliberate drag to close.
const FIRM_RESISTANCE = 0.55;
const FIRM_DISMISS_DISTANCE = 240;
const FIRM_DISMISS_VELOCITY = 1.8;
const FIRM_MIN_FLICK_DISTANCE = 120;
// How far a flick keeps scrolling, in px per (px/ms) of release velocity.
const MOMENTUM_FACTOR = 320;

type SheetScrollArea = {
  scrollY: Animated.Value;
  setViewportHeight: (height: number) => void;
  setContentHeight: (height: number) => void;
};

const SheetScrollContext = createContext<SheetScrollArea | null>(null);

type Props = {
  visible: boolean;
  onClose: () => void;
  closeLabel: string;
  sheetStyle?: StyleProp<ViewStyle>;
  /** Makes swipe-to-close harder, for steps where an accidental close would lose work. */
  swipeToClose?: "normal" | "firm";
  /** Android back button / gesture: go to the previous step instead of closing, when set. */
  onBack?: () => void;
  children: React.ReactNode;
};

/**
 * Animated bottom sheet that owns every vertical drag. Content inside a SheetScrollView is
 * scrolled by the same gesture, so dragging down from anywhere scrolls back to the top and
 * then keeps pulling the sheet down until it closes.
 */
export function BottomSheet({ visible, onClose, closeLabel, sheetStyle, swipeToClose = "normal", onBack, children }: Props): React.JSX.Element {
  const { height: windowHeight } = useWindowDimensions();
  const firmRef = useRef(swipeToClose === "firm");
  firmRef.current = swipeToClose === "firm";
  const canPullSheet = useRef(true);
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(windowHeight);
  const sheetHeightRef = useRef(windowHeight);
  const scrollPos = useRef(0);
  const dragStartScroll = useRef(0);
  const startedOnBackdrop = useRef(false);
  const sheetTopRef = useRef(windowHeight);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const closingRef = useRef(false);
  // Keep the last visible content on screen while the sheet animates out.
  const lastChildren = useRef(children);
  if (visible) lastChildren.current = children;

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => { scrollPos.current = value; });
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  const scrollArea = useMemo<SheetScrollArea>(() => ({
    scrollY,
    setViewportHeight: (height) => { viewportHeight.current = height; },
    setContentHeight: (height) => { contentHeight.current = height; }
  }), [scrollY]);

  useEffect(() => {
    translateY.stopAnimation();
    if (visible) {
      closingRef.current = false;
      scrollY.stopAnimation();
      scrollY.setValue(0);
      scrollPos.current = 0;
      setMounted(true);
      translateY.setValue(windowHeight);
      Animated.timing(translateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      return undefined;
    }
    // Always unmount once hidden, even if the exit animation is interrupted;
    // a lingering transparent Modal would swallow every touch and freeze the app.
    const unmount = (): void => { if (!visibleRef.current) setMounted(false); };
    const fallback = setTimeout(unmount, 400);
    Animated.timing(translateY, { toValue: sheetHeightRef.current, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true })
      .start(unmount);
    return () => clearTimeout(fallback);
  }, [visible]);

  const dismiss = useMemo(() => () => {
    if (closingRef.current) return;
    closingRef.current = true;
    translateY.stopAnimation();
    let closed = false;
    const close = (): void => {
      if (closed) return;
      closed = true;
      onCloseRef.current();
    };
    setTimeout(close, 300);
    Animated.timing(translateY, { toValue: sheetHeightRef.current, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true })
      .start(close);
  }, [translateY]);

  const maxScroll = (): number => Math.max(0, contentHeight.current - viewportHeight.current);
  const settle = (): void => {
    if (closingRef.current) return;
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 16 }).start();
  };
  const fling = (velocity: number): void => {
    const target = Math.min(maxScroll(), Math.max(0, scrollPos.current + velocity * MOMENTUM_FACTOR));
    if (Math.abs(target - scrollPos.current) < 1) return;
    const duration = Math.min(700, Math.max(220, Math.abs(velocity) * 260));
    Animated.timing(scrollY, { toValue: target, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  };
  const dragging = useRef(false);

  // Native pan recognizer on the full-screen overlay: it activates on any vertical drag
  // (backdrop, header, buttons or content) and cancels the touched Pressable.
  const pan = usePanGesture({
    runOnJS: true,
    disableReanimated: true,
    activeOffsetY: [-8, 8],
    failOffsetX: [-24, 24],
    onBegin: () => {
      // Stop an ongoing fling on touch, like a native scroll view.
      scrollY.stopAnimation();
    },
    onActivate: (event) => {
      if (closingRef.current || !visibleRef.current) return;
      dragging.current = true;
      translateY.stopAnimation();
      // A drag starting on the backdrop pulls the sheet directly without scrolling its content.
      const startY = event.absoluteY - event.translationY;
      startedOnBackdrop.current = startY < sheetTopRef.current;
      dragStartScroll.current = startedOnBackdrop.current ? 0 : scrollPos.current;
      // In firm mode, scrolling the content back to the top never carries on into closing the sheet.
      canPullSheet.current = !firmRef.current || startedOnBackdrop.current || scrollPos.current <= 0;
    },
    onUpdate: (event) => {
      if (!dragging.current || closingRef.current) return;
      const desired = dragStartScroll.current - event.translationY;
      if (desired >= 0) {
        if (!startedOnBackdrop.current) scrollY.setValue(Math.min(maxScroll(), desired));
        translateY.setValue(0);
      } else {
        // Content is at the top: the rest of the drag pulls the sheet down.
        if (!startedOnBackdrop.current) scrollY.setValue(0);
        translateY.setValue(canPullSheet.current ? -desired * (firmRef.current ? FIRM_RESISTANCE : 1) : 0);
      }
    },
    onDeactivate: (event) => {
      if (!dragging.current) return;
      dragging.current = false;
      const velocity = event.velocityY / 1000;
      const pulled = event.translationY - dragStartScroll.current;
      if (pulled > 0) {
        const firm = firmRef.current;
        const shouldDismiss = canPullSheet.current && (firm
          ? pulled > FIRM_DISMISS_DISTANCE || (velocity > FIRM_DISMISS_VELOCITY && pulled > FIRM_MIN_FLICK_DISTANCE)
          : pulled > DISMISS_DISTANCE || (velocity > DISMISS_VELOCITY && pulled > 20));
        if (!event.canceled && shouldDismiss) dismiss();
        else settle();
        return;
      }
      settle();
      if (!startedOnBackdrop.current && !event.canceled) fling(-velocity);
    }
  });

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, Math.max(1, sheetHeight)],
    outputRange: [1, 0],
    extrapolate: "clamp"
  });

  return (
    <Modal animationType="none" onRequestClose={onBack ?? dismiss} statusBarTranslucent transparent visible={mounted}>
      <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={pan}>
      <View pointerEvents={visible ? "auto" : "none"} style={styles.overlay}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
        <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={dismiss} style={styles.fill} />
        <Animated.View
          accessibilityViewIsModal
          onLayout={(event) => {
            sheetTopRef.current = event.nativeEvent.layout.y;
            sheetHeightRef.current = event.nativeEvent.layout.height;
            setSheetHeight(event.nativeEvent.layout.height);
          }}
          style={[styles.sheet, sheetStyle, { transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />
          <SheetScrollContext.Provider value={scrollArea}>
            {visible ? children : lastChildren.current}
          </SheetScrollContext.Provider>
        </Animated.View>
      </View>
      </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

type SheetScrollViewProps = {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  children?: React.ReactNode;
};

/** Scrollable area driven by the parent BottomSheet's drag gesture. */
export function SheetScrollView({ style, contentContainerStyle, children }: SheetScrollViewProps): React.JSX.Element {
  const area = useContext(SheetScrollContext);
  const translate = useMemo(() => (area ? Animated.multiply(area.scrollY, -1) : 0), [area]);
  // A new scroll area (e.g. the next step of a flow) starts at the top.
  useEffect(() => {
    area?.scrollY.stopAnimation();
    area?.scrollY.setValue(0);
  }, [area]);
  return (
    <View
      onLayout={(event) => area?.setViewportHeight(event.nativeEvent.layout.height)}
      style={[styles.scrollViewport, style]}
    >
      <Animated.View
        onLayout={(event) => area?.setContentHeight(event.nativeEvent.layout.height)}
        style={[contentContainerStyle, { transform: [{ translateY: translate }] }]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1, justifyContent: "flex-end" },
  fill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(25, 32, 26, 0.42)" },
  sheet: { backgroundColor: palette.paper, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#D6D9D0", alignSelf: "center", marginBottom: 16 },
  scrollViewport: { flexShrink: 1, overflow: "hidden" }
});
