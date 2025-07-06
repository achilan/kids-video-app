import { deleteVideoById, fetchAllVideos, insertVideo } from "@/database/db";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { ActivityIndicator } from "react-native-paper";

type VideoMeta = {
  id: number;
  title: string;
  category: string;
  uri: string;
};

const categories = [
  "Animales",
  "Música",
  "Aprender",
  "Cuentos",
  "Diversión",
  "Otros",
];
const ADMIN_PIN = "1234";

export default function AdminScreen() {
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [videos, setVideos] = useState<any[]>([]);

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      copyToCacheDirectory: true,
    });
    console.log("Video seleccionado:", result);
    if (!result.canceled) {
      setSelectedVideo(result);
      Alert.alert(
        "✅ Video seleccionado",
        result.assets?.[0]?.name ?? "Sin nombre"
      );
    }
  };

  const saveVideo = async () => {
    if (!selectedVideo || !title) {
      Alert.alert("Error", "Selecciona un video y escribe un título");
      return;
    }
    if (thumbnail) {
      if (!thumbnail.startsWith("http")) {
        Alert.alert("Error", "La portada debe ser una URL válida");
        return;
      }
    }

    try {
      const videoDir = FileSystem.documentDirectory + "videos/";
      const fileUri = videoDir + (selectedVideo?.assets?.[0]?.name ?? "");

      const dirInfo = await FileSystem.getInfoAsync(videoDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(videoDir, { intermediates: true });
      }

      await FileSystem.copyAsync({
        from: selectedVideo?.assets?.[0]?.uri ?? "",
        to: fileUri,
      });

      console.log(thumbnail);

      const vide = await insertVideo(title, category, fileUri, thumbnail);

      setSelectedVideo(null);
      setTitle("");
      console.log("Video guardado:", vide);
      Alert.alert("✅ Éxito", "Video guardado correctamente");
      setCategory(categories[0]); // Reset category to default
      setThumbnail(""); // Reset thumbnail input
      loadVideos(); // Reload videos after saving
    } catch (error: any) {
      Alert.alert("Error al guardar video", error.message);
    }
  };

  const unlock = () => {
    if (pin === ADMIN_PIN) {
      setIsUnlocked(true);
      setPin("");
    } else {
      Alert.alert("❌ PIN incorrecto", "Intenta nuevamente");
    }
  };
  const loadVideos = async () => {
    setLoading(true);
    console.log("Cargando videos guardados...");
    const allVideos = await fetchAllVideos();

    // Agrega el tamaño a cada video
    const videosWithSizes = await Promise.all(
      allVideos.map(async (video) => {
        const size = await getSizeOfFile(video.uri);
        return { ...video, size }; // nuevo campo 'size'
      })
    );

    setVideos(videosWithSizes);
    setLoading(false);
  };
  const getSizeOfFile = async (uri: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        const sizeInBytes = fileInfo.size || 0;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        return `${sizeInMB} MB`;
      } else {
        return "Archivo no encontrado";
      }
    } catch (error) {
      console.error("Error al obtener el tamaño del archivo:", error);
      return "Error al obtener el tamaño";
    }
  };

  const deleteVideo = async (id: number) => {
    try {
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que quieres eliminar este video?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            onPress: async () => {
              try {
                await FileSystem.deleteAsync(
                  videos.find((v) => v.id === id)?.uri ?? "",
                  { idempotent: true } // Esto evita errores si el archivo no existe
                );
                console.log("Video eliminado:", id);
                Alert.alert("✅ Éxito", "Video eliminado correctamente");
                await deleteVideoById(id); // Asegúrate de implementar esta función
                loadVideos(); // Reload videos after deletion
              } catch (error: any) {
                console.error("Error al eliminar video:", error);
                Alert.alert("Error al eliminar video", error.message);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error al eliminar video", error.message);
    }
  };
  useEffect(() => {
    // Aquí podrías cargar los videos guardados desde la base de datos

    loadVideos();
  }, []);

  if (!isUnlocked) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.lockText}>🔒 Ingrese PIN para acceder</Text>
        <TextInput
          placeholder="PIN"
          placeholderTextColor="#999"
          secureTextEntry
          value={pin}
          onChangeText={setPin}
          style={styles.pinInput}
          keyboardType="number-pad"
        />
        <TouchableOpacity onPress={unlock} style={styles.unlockButton}>
          <Text style={styles.unlockText}>Desbloquear</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>🎥 Subir Video</Text>

          <TouchableOpacity onPress={pickVideo} style={styles.button}>
            <Text style={styles.buttonText}>
              {selectedVideo ? "Cambiar Video" : "Seleccionar Video"}
            </Text>
          </TouchableOpacity>

          {selectedVideo && (
            <Text style={styles.selected}>
              {selectedVideo.assets?.[0]?.name}
            </Text>
          )}

          <TextInput
            placeholder="Título del video"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Categoría:</Text>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryButton,
                category === cat && styles.selectedCategory,
              ]}
            >
              <Text style={{ color: "#fff" }}>{cat}</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            placeholder="Portada del video"
            placeholderTextColor="#999"
            value={thumbnail}
            onChangeText={setThumbnail}
            style={styles.input}
          />

          <TouchableOpacity
            onPress={saveVideo}
            style={[styles.button, { marginTop: 20 }]}
          >
            <Text style={styles.buttonText}>Guardar Video</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 30 }]}>
            Videos guardados:
          </Text>
        </View>
      }
      data={videos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.videoItem}>
          <Text style={{ color: "#fff" }}>
            {item.title} ({item.category}) - {item.size || "Tamaño desconocido"}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 5 }}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                "Video seleccionado",
                `Título: ${item.title}\nCategoría: ${item.category}`
              );
            }}
          >
            <Text style={{ color: "#FF0000", fontWeight: "bold" }}>
              Ver Detalles
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 5 }}
            onPress={() => deleteVideo(item.id)}
          >
            <Text style={{ color: "#FF0000", fontWeight: "bold" }}>
              Eliminar Video
            </Text>
          </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      ListEmptyComponent={
        !loading && (
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
            No hay videos guardados
          </Text>
        )
      }
      ListFooterComponent={
        loading ? (
          <ActivityIndicator
            size="large"
            color="#FF0000"
            style={{ marginTop: 20 }}
          />
        ) : null
      }
      style={{ backgroundColor: "#000" }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  lockScreen: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
  },
  pinInput: {
    borderColor: "#444",
    borderWidth: 1,
    borderRadius: 10,
    width: "60%",
    padding: 10,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  unlockButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  unlockText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 40,
  },
  selected: {
    color: "#fff",
    marginVertical: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    borderRadius: 10,
    color: "#fff",
    marginVertical: 10,
  },
  label: {
    color: "#fff",
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  categoryButton: {
    padding: 10,
    backgroundColor: "#333",
    marginVertical: 5,
    borderRadius: 10,
  },
  selectedCategory: {
    backgroundColor: "#FF0000",
  },
  videoItem: {
    padding: 10,
    backgroundColor: "#111",
    marginVertical: 5,
    borderRadius: 10,
  },
});
