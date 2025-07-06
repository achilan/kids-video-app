import * as SQLite from "expo-sqlite";

// Promesa persistente de conexión
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Obtener instancia única de la base de datos
function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("videos.db");
  }
  return dbPromise;
}

// Inicializar base de datos
export async function initDB() {
  const db = await getDB();
  const stmt = await db.prepareAsync(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      uri TEXT NOT NULL,
      thumbnail TEXT
    );
  `);
  await stmt.executeAsync();
  await stmt.finalizeAsync();
  console.log("✅ Tabla 'videos' lista");
}

// Insertar un nuevo video
export async function insertVideo(
  title: string,
  category: string,
  uri: string,
  thumbnail: string
) {
  if (!title || !category || !uri) {
    throw new Error("Todos los campos son obligatorios");
  }

  await initDB();
  const db = await getDB();
  const stmt = await db.prepareAsync(
    `INSERT INTO videos (title, category, uri,thumbnail) VALUES (?, ?, ?,?)`
  );
  await stmt.executeAsync([title, category, uri, thumbnail]);
  await stmt.finalizeAsync();
  console.log("✅ Video insertado:", title, category);
}

// Obtener videos por categoría
export async function fetchVideosByCategory(category: string) {
  if (!category) throw new Error("La categoría es obligatoria");

  await initDB();
  const db = await getDB();

  try {
    const videos = await db.getAllAsync(
      `SELECT * FROM videos WHERE category = ?`,
      [category]
    );
    console.log(`📂 ${category}: ${videos.length} videos encontrados`);
    return videos;
  } catch (error) {
    console.error("❌ Error al obtener videos por categoría:", error);
    throw new Error("Error al obtener videos por categoría");
  }
}

// Obtener todos los videos
export async function fetchAllVideos() {
  await initDB(); // aseguramos la tabla
  const db = await getDB();

  try {
    console.log("📥 Ejecutando consulta directa a la tabla videos");
    const videos = await db.getAllAsync(`SELECT * FROM videos`);
    console.log("📦 Videos obtenidos:", videos);
    return videos;
  } catch (error) {
    console.error("❌ Error al obtener videos:", error);
    throw new Error("Error al obtener videos");
  }
}

// Eliminar video (opcional para admin)
export async function deleteVideoById(id: number) {
  try {
    console.log(`🗑️ Eliminando video con ID: ${id}`);
    if (typeof id !== "number" || isNaN(id)) {
      throw new Error("ID inválido");
    }

    await initDB(); // asegúrate que la DB y tabla existen
    const db = await getDB();

    const stmt = await db.prepareAsync(`DELETE FROM videos WHERE id = ?`);
    const result = await stmt.executeAsync([id]);
    await stmt.finalizeAsync();

    if (result.changes === 0) {
      console.warn(`⚠️ No se encontró video con ID: ${id}`);
      return false;
    }

    console.log(`🗑️ Video eliminado correctamente. ID: ${id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar video ID ${id}:`, error);
    throw new Error("No se pudo eliminar el video");
  }
}