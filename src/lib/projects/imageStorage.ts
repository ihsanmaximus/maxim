export type StoredImage = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
};

const DB_NAME = "maximus-image-storage";
const DB_VERSION = 1;
const STORE_NAME = "project-images";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB tidak tersedia di browser ini."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "projectId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Gagal membuka database gambar."));
  });
}

type ProjectImageRecord = {
  projectId: string;
  images: StoredImage[];
};

export async function getProjectImages(
  projectId: string,
): Promise<StoredImage[]> {
  const db = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction
        .objectStore(STORE_NAME)
        .get(projectId);

      request.onsuccess = () => {
        const record = request.result as ProjectImageRecord | undefined;
        resolve(Array.isArray(record?.images) ? record.images : []);
      };

      request.onerror = () =>
        reject(request.error ?? new Error("Gagal membaca galeri."));
    });
  } finally {
    db.close();
  }
}

export async function saveProjectImages(
  projectId: string,
  images: StoredImage[],
): Promise<void> {
  const db = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).put({
        projectId,
        images,
      } satisfies ProjectImageRecord);

      transaction.oncomplete = () => resolve();

      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Gagal menyimpan galeri."));

      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Penyimpanan galeri dibatalkan."));
    });
  } finally {
    db.close();
  }
}
