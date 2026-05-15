/**
 * AssetGalleryModal — Dark Cyber-Football theme
 * Frosted glass modal with search, grid view, and upload-to-gallery option.
 * Used for: card backgrounds, club logos, league logos, nation flags.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, X, Check, ImageIcon } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

export interface GalleryAsset {
  id: string;
  name: string;
  url: string;
  file?: File;
}

interface AssetGalleryModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  assets: GalleryAsset[];
  selectedId?: string;
  onSelect: (asset: GalleryAsset) => void;
  onUpload?: (asset: GalleryAsset) => void;
  allowUpload?: boolean;
}

export default function AssetGalleryModal({
  open,
  onClose,
  title,
  assets,
  selectedId,
  onSelect,
  onUpload,
  allowUpload = true,
}: AssetGalleryModalProps) {
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files || !onUpload) return;
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        
        // Use FileReader for better iPhone compatibility
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const asset: GalleryAsset = {
            id: `upload-${Date.now()}-${Math.random()}`,
            name: file.name.replace(/\.[^.]+$/, ""),
            url,
            file,
          };
          onUpload(asset);
        };
        reader.readAsDataURL(file);
      });
    },
    [onUpload]
  );

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <div className="modal-backdrop absolute inset-0" />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl panel overflow-hidden"
            style={{ maxHeight: "85vh" }}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="section-label mb-0.5">Select Photos</p>
                <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-border">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground input-glow hex-input"
                  autoFocus
                />
              </div>
            </div>

            {/* Upload zone */}
            {allowUpload && (
              <div className="px-5 py-3 border-b border-border">
                <div
                  className={`upload-zone flex items-center gap-3 px-4 py-3 cursor-pointer ${dragOver ? "drag-over" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Upload size={14} className="text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Upload to your gallery</p>
                    <p className="text-xs text-muted-foreground">Click or drag & drop PNG/JPG files</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "45vh" }}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">No assets found</p>
                  {search && (
                    <p className="text-xs mt-1 opacity-60">Try a different search term</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {filtered.map((asset) => {
                    const isSelected = asset.id === selectedId;
                    return (
                      <motion.button
                        key={asset.id}
                        className={`asset-thumb relative aspect-square bg-muted flex items-center justify-center ${isSelected ? "selected" : ""}`}
                        onClick={() => { onSelect(asset); onClose(); }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 opacity-0 hover:opacity-100 transition-opacity duration-150">
                          <p className="text-[9px] text-white truncate font-medium">{asset.name}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer count */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {filtered.length} asset{filtered.length !== 1 ? "s" : ""}
                {search && ` matching "${search}"`}
              </p>
              <button
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
