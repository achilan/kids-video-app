# 🎥 Video Player App - Estilo YouTube Kids

Una app móvil hecha con **React Native + Expo**, pensada para niños. Permite reproducir videos seguros y muestra videos relacionados, con una interfaz sencilla, animaciones suaves y controles táctiles amigables.

## ✨ Características

- Reproductor de video a pantalla completa usando `expo-av`.
- Detección de orientación de pantalla con `expo-screen-orientation`.
- Ocultamiento de UI nativa con `expo-system-ui`.
- Lista de videos relacionados que aparece automáticamente al girar la pantalla (en tablets).
- FAB animado (Floating Action Button) para mostrar u ocultar la lista de videos relacionados.
- Navegación entre videos sin recargar el componente.
- Interfaz responsiva, adaptada para teléfonos y tablets.
- Animaciones con `react-native-reanimated`.

## 📦 Tecnologías usadas

- React Native + Expo
- TypeScript
- `expo-av` para el video
- `react-navigation` para navegación
- `react-native-reanimated` para animaciones
- `@expo/vector-icons` para iconos

## 📱 Pantallas principales

- **VideoPlayerScreen**: Reproduce un video, permite ver videos relacionados y cambiar de video sin salir de la vista actual.

## 🧠 Cómo funciona

- El video se reproduce automáticamente y se muestra a pantalla completa si el usuario gira el dispositivo.
- Si el dispositivo es una tablet en modo horizontal, los videos relacionados se muestran automáticamente.
- Al tocar la pantalla, aparece un botón flotante (`FAB`) para mostrar/ocultar manualmente los relacionados.
- Al seleccionar un video relacionado, el reproductor se reemplaza por el nuevo sin salir de la pantalla.

## ▶️ Comandos útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npx expo start

📝 Notas
	•	Asegúrate de subir tus videos o enlaces desde un backend seguro.
	•	Esta app está diseñada para ejecutarse 100% offline si se cachean previamente los videos.

📌 Por hacer
	•	Agregar filtros por categoría
	•	Bloqueo parental
	•	Integración con base de datos
	•	Buscador de videos

© 2025 Anthony Chilan