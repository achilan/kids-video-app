import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function VideoPlayerScreen() {
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();

  const { video, relatedVideos = [] } = route.params as {
    video: { title: string; uri: string; thumbnail?: string; id: number };
    relatedVideos: {
      title: string;
      uri: string;
      thumbnail?: string;
      id: number;
    }[];
  };

  const videoRef = useRef<Video>(null);
  const scale = useSharedValue(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRelated, setShowRelated] = useState(false); // ocultos por defecto

  const handlePressIn = () => (scale.value = withSpring(0.96));
  const handlePressOut = () => (scale.value = withSpring(1));
  const isTablet = width >= 768;

  const showFAB = useSharedValue(0); // 0 = oculto, 1 = visible

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showFAB.value, { duration: 300 }),
    transform: [
      {
        scale: withTiming(showFAB.value ? 1 : 0.5, { duration: 300 }),
      },
    ],
  }));

  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener(
      ({ orientationInfo }) => {
        const isLandscape =
          orientationInfo.orientation ===
            ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          orientationInfo.orientation ===
            ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

        setIsFullscreen(isLandscape);
        StatusBar.setHidden(isLandscape, "fade");
        SystemUI.setEnabledAsync(
          SystemUI.SystemBarsStatusBar | SystemUI.SystemBarsNavigationBar,
          !isLandscape
        );

        // Mostrar relacionados por defecto si es tablet en horizontal
        if (isLandscape && isTablet) {
          setShowRelated(true);
        } else {
          setShowRelated(false);
        }
      }
    );

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, [isTablet, width]);

  const onVideoPress = () => {
    setShowRelated((prev) => !prev);
    showFAB.value = 1;

    setTimeout(() => {
      showFAB.value = 0;
    }, 4000);
  };

  const playVideo = (selected: any) => {
    navigation.replace(
      "Player" as never,
      {
        video: selected,
        relatedVideos,
      } as never
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />

      <TouchableWithoutFeedback onPress={onVideoPress}>
        <View style={[styles.videoWrapper, { height: height }]}>
          <Video
            ref={videoRef}
            source={{ uri: video.uri }}
            style={{ width: width, height: height }}
            useNativeControls
            shouldPlay
            usePoster
            posterSource={{ uri: video.thumbnail || video.uri }}
            posterStyle={{ width: width, height: height }}
          />

          {!isFullscreen && (
            <View style={styles.overlayTitle}>
              <Text style={styles.overlayText}>{video.title}</Text>
            </View>
          )}

          {!isFullscreen && (
            <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
              {/*  <View
                style={[
                  styles.backButton,
                  Platform.OS === "ios" && { top: 80 },
                ]}
              >
                <Text style={styles.backText}>←</Text>
              </View> */}
              <MaterialIcons
                name="arrow-back"
                size={60}
                color="#fff"
                style={[
                  styles.backButton,
                  Platform.OS === "ios" && { top: 80 },
                ]}
                onPress={() => navigation.goBack()}
              />
            </TouchableWithoutFeedback>
          )}
        </View>
      </TouchableWithoutFeedback>

      {showRelated && (
        <View
          style={{
            position: isFullscreen ? "absolute" : "relative",
            bottom: 200,
            width: "100%",
            backgroundColor: isFullscreen ? "rgba(0,0,0,0.6)" : "#121212",
            paddingVertical: 10,
            paddingHorizontal: 10,
            zIndex: 9999,
            ...(!isFullscreen && styles.relatedInFullscreen),
          }}
        >
          <Text style={styles.sectionTitle}>Videos relacionados</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedListContainer}
            data={relatedVideos.filter((v) => v.id !== video.id)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => playVideo(item)}
              >
                <Animated.View
                  style={[styles.relatedCardSmall, fabAnimatedStyle]}
                >
                  {item.thumbnail && (
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.thumbnailSmall}
                    />
                  )}
                  {!item.thumbnail && (
                    <Image
                      source={require("@/assets/images/animatedkid.jpg")}
                      style={styles.thumbnailSmall}
                    />
                  )}
                </Animated.View>
              </TouchableWithoutFeedback>
            )}
            ListEmptyComponent={() => <Text>No hay datos</Text>}
          />
        </View>
      )}

      {/* FAB centrado abajo con animación */}
      <Animated.View style={[styles.fab, fabAnimatedStyle]}>
        <TouchableWithoutFeedback onPress={onVideoPress}>
          <View style={styles.fabInner}>
            <MaterialIcons
              name={showRelated ? "close" : "folder"}
              size={28}
              color="#fff"
            />
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoWrapper: {
    width: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  overlayTitle: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  overlayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    marginBottom: 10,
  },
  relatedListContainer: {
    paddingLeft: 10,
  },
  relatedCardSmall: {
    marginRight: 10,
  },
  thumbnailSmall: {
    width: 120,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  relatedInFullscreen: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 10,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    zIndex: 20,
  },
  fabInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  fabIcon: {
    color: "#fff",
    fontSize: 24,
  },
});
