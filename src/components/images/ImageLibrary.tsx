"use client";

import { useEffect, useRef, useState } from "react";
import { getProjectData } from "@/lib/projects/projectStorage";
import {
  getProjectImages,
  saveProjectImages,
  type StoredImage,
} from "@/lib/projects/imageStorage";

type ImageItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
};

type Props = {
  projectId?: string;
  projectName?: string;
};

export default function ImageLibrary({
  projectId,
  projectName = "New Project",
}: Props) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      if (!projectId) {
        setImages([]);
        setLoadedProjectId(null);
        return;
      }

      setLoadedProjectId(null);
      setNotice("Memuat galeri...");

      try {
        let savedImages = await getProjectImages(projectId);

        // Migrate legacy localStorage images only if IndexedDB is empty.
        if (savedImages.length === 0) {
          const legacyImages = getProjectData<StoredImage[]>(
            projectId,
            "image-library",
            [],
          );

          if (Array.isArray(legacyImages) && legacyImages.length > 0) {
            savedImages = legacyImages;
            await saveProjectImages(projectId, savedImages);
          }
        }

        if (cancelled) return;
        setImages(savedImages);
        setLoadedProjectId(projectId);
        setNotice("Galeri siap");
      } catch (error) {
        console.error("Image Library load failed:", error);
        if (cancelled) return;
        setImages([]);
        setNotice("Gagal memuat galeri. Coba muat ulang halaman.");
        setLoadedProjectId(projectId);
      }
    }

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectId || loadedProjectId !== projectId) return;

    let cancelled = false;

    async function persistImages() {
      if (!projectId || loadedProjectId !== projectId) return;

      try {
        await saveProjectImages(projectId, images);
        if (!cancelled) setNotice("Tersimpan");
      } catch (error) {
        console.error("Image Library save failed:", error);
        if (!cancelled) {
          setNotice("Gagal menyimpan galeri. Periksa kapasitas browser.");
        }
      }
    }

    void persistImages();

    return () => {
      cancelled = true;
    };
  }, [projectId, loadedProjectId, images]);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      setNotice("Hanya file gambar yang dapat diunggah.");
    }

    if (!validFiles.length) return;

    setBusy(true);

    try {
      const newImages = await Promise.all(
        validFiles.map(
          (file) =>
            new Promise<ImageItem>((resolve, reject) => {
              const reader = new FileReader();

              reader.onload = () => {
                if (typeof reader.result !== "string") {
                  reject(new Error("Gagal membaca gambar."));
                  return;
                }

                resolve({
                  id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  dataUrl: reader.result,
                  createdAt: new Date().toISOString(),
                });
              };

              reader.onerror = () => reject(new Error("Gagal membaca gambar."));
              reader.readAsDataURL(file);
            }),
        ),
      );

      if (!projectId) {
        setNotice("Pilih proyek terlebih dahulu.");
        return;
      }

      const currentImages = await getProjectImages(projectId);
      const combinedImages = [...currentImages, ...newImages];

      await saveProjectImages(projectId, combinedImages);
      setImages(combinedImages);
      setLoadedProjectId(projectId);
      setNotice(`${newImages.length} gambar berhasil disimpan.`);
    } catch {
      setNotice("Gagal membaca gambar. Silakan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  function renameImage(image: ImageItem) {
    const nextName = window.prompt("Nama gambar:", image.name);

    if (nextName === null) return;

    const cleanName = nextName.trim();

    if (!cleanName) {
      setNotice("Nama gambar tidak boleh kosong.");
      return;
    }

    if (!projectId) return;

    void (async () => {
      try {
        const current = await getProjectImages(projectId);
        const next = current.map((item) =>
          item.id === image.id ? { ...item, name: cleanName } : item,
        );
        await saveProjectImages(projectId, next);
        setImages(next);
        setNotice("Nama gambar disimpan.");
      } catch (error) {
        console.error("Image rename failed:", error);
        setNotice("Gagal menyimpan nama gambar.");
      }
    })();
  }

  function deleteImage(image: ImageItem) {
    const confirmed = window.confirm(
      `Hapus gambar "${image.name}" dari proyek ini?`,
    );

    if (!confirmed) return;

    if (!projectId) return;

    void (async () => {
      try {
        const current = await getProjectImages(projectId);
        const next = current.filter((item) => item.id !== image.id);
        await saveProjectImages(projectId, next);
        setImages(next);
        setNotice("Gambar dihapus.");
      } catch (error) {
        console.error("Image deletion failed:", error);
        setNotice("Gagal menghapus gambar.");
      }
    })();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (!projectId) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">Image Library</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Buka atau buat proyek terlebih dahulu agar gambar dapat disimpan
          secara terpisah untuk setiap proyek.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Workspace / Assets
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            Image Library
          </h2>
          <p className="mt-2 text-sm text-slate-500">{projectName}</p>
        </div>

        <button
          type="button"
          disabled={busy || loadedProjectId !== projectId}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? "Memproses..." : "+ Upload Gambar"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">{images.length}</strong> gambar
        </p>
        <p aria-live="polite" className="text-xs text-slate-500">
          {loadedProjectId !== projectId ? "Memuat gambar..." : notice || "Siap"}
        </p>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewImage(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Preview ${previewImage.name}`}
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {previewImage.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatSize(previewImage.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                aria-label="Tutup preview"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </header>

            <div className="flex min-h-0 items-center justify-center overflow-auto bg-slate-100 p-3 sm:p-6">
              <img
                src={previewImage.dataUrl}
                alt={previewImage.name}
                className="max-h-[72vh] max-w-full object-contain"
              />
            </div>
          </section>
        </div>
      )}

      {images.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <div className="text-4xl text-slate-300" aria-hidden="true">▧</div>
          <h3 className="mt-4 font-bold text-slate-800">
            Belum ada gambar
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Tambahkan foto produk, gambar hero, ilustrasi, atau aset visual
            lain untuk proyek ini.
          </p>
          <button
            type="button"
            disabled={loadedProjectId !== projectId || busy}
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Pilih Gambar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <article
              key={image.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setPreviewImage(image)}
                title={`Preview ${image.name}`}
                className="block aspect-square w-full bg-slate-100"
              >
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="h-full w-full object-cover"
                />
              </button>

              <div className="p-3">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {image.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatSize(image.size)}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => renameImage(image)}
                    className="flex-1 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteImage(image)}
                    className="flex-1 rounded-lg border border-red-100 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs leading-5 text-slate-500">
        Catatan: versi awal menyimpan data gambar di penyimpanan browser per
        proyek. Kapasitasnya terbatas, sehingga gunakan gambar berukuran wajar.
      </p>
    </section>
  );
}
