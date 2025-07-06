import { fetchAllVideos } from "@/database/db"; // tu función para traer todos los videos
import { EvilIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [groupedVideos, setGroupedVideos] = useState<{
    [category: string]: any[];
  }>({});
  const [allvideos,setAllvideos] = useState<any>([]);
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;
 const loadVideos = async () => {
      const all = await fetchAllVideos(); // [{ id, title, category, uri }]
      console.log("Videos cargados:", all);
      setAllvideos(all)
      const grouped: { [category: string]: any[] } = {};

      for (const video of all) {
        if (!grouped[video.category]) grouped[video.category] = [];
        grouped[video.category].push(video);
      }

      setGroupedVideos(grouped);
    };
  useEffect(() => {
    console.log("Cargando videos...");
   

    loadVideos();
  }, []);

const goToPlayer = (video: any) => {
  navigation.navigate("Player" as never, {
    video,
    relatedVideos: allvideos,
    isFullscreen: true, // opcional, para iniciar en fullscreen
  } as never);
};
useLayoutEffect(() => {
  navigation.setOptions({
    headerShown: false, // ocultar el header por defecto
  });
  loadVideos(); // cargar videos al montar el componente
}, [navigation]);
  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.header, isTablet && { fontSize: 32 }]}>Videos</Text>
      {Object.entries(groupedVideos).map(([category, videos]) => (
        <View key={category} style={styles.categoryBlock}>
          <Text style={[styles.categoryTitle, isTablet && { fontSize: 28 }]}>
            {category}
          </Text>

          <FlatList
            data={videos}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.videoCard, isTablet && styles.videoCardTablet]}
                onPress={() => goToPlayer(item)}
                activeOpacity={0.8}
              >
                <View style={styles.thumbnailWrapper}>
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={[
                      styles.thumbnail,
                      isTablet && styles.thumbnailTablet,
                    ]}
                    resizeMode="cover"
                  />
                  <View style={styles.playOverlay}>
                    <EvilIcons name="play" style={styles.playIcon} />
                  </View>
                </View>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.videoTitle,
                    isTablet && styles.videoTitleTablet,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff", // blanco puro
    marginBottom: 20,
    textAlign: "center",
  },
  categoryBlock: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff", // blanco puro
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  videoCardTablet: {
    width: 220,
  },
  videoTitleTablet: {
    fontSize: 18,
    paddingHorizontal: 15,
  },
  thumbnailWrapper: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#000000", // negro puro fondo
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  videoCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: "#1e1e1e", // gris oscuro card
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
    height: 220,
  },
  thumbnail: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#2c2c2c", // gris pizarra imagen fondo
  },
  videoTitle: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  playOverlay: {
    position: "absolute",
    top: "40%",
    left: "45%",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 6,
  },
  playIcon: {
    color: "#f1f1f1", // casi blanco para icono
    fontSize: 20,
    fontWeight: "bold",
  },
  thumbnailTablet: {
    width: "100%",
    height: 160,
  },
});
