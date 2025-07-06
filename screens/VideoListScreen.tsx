import { fetchVideosByCategory } from '@/database/db';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type VideoItem = {
  id: number;
  title: string;
  path: string;
  category: string;
};

export default function VideoListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params as { category: string };

  const [videos, setVideos] = useState<VideoItem[]>([]);

  // ⚠️ Por ahora usamos datos falsos. Luego los traeremos desde SQLite.

useEffect(() => {
  fetchVideosByCategory(category)
    .then((data) => setVideos(data))
    .catch((err) => {
      console.error('Error fetching videos:', err);
      setVideos([]);
    });
}, [category]);

  const openVideo = (video: VideoItem) => {
    navigation.navigate('Player' as never, { video } as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Videos: {category}</Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openVideo(item)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>No hay videos aún.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    padding: 20,
    backgroundColor: '#add8e6',
    borderRadius: 15,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
  },
});