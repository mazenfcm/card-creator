/**
 * RenderUploadZone — Dark Cyber-Football theme
 * Drag & drop / click-to-upload zone for the player render layer.
 */
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, User } from "lucide-react";

interface RenderUploadZoneProps {
  value?: string; // object URL
  onChange?: (url: string | undefined, file: File | undefined) => void;
  onUpload?: (url: string) => void;
}

export default function RenderUploadZone({ value, onChange, onUpload }: RenderUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file || !file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      if (onChange) onChange(url, file);
      if (onUpload) onUpload(url);
    },
    [onChange, onUpload]
  );

  return (
    <div>
      <label className="section-label block mb-1.5">Player Render</label>
      <div
        className={`upload-zone relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${dragOver ? "drag-over" : ""}`}
        style={{ minHeight: "120px" }}
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="preview"
              className="relative w-full flex items-center gap-3 px-4 py-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-purple-500/40 flex-shrink-0">
                <img src={value} alt="Render" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Render uploaded</p>
                <p className="text-xs text-muted-foreground mt-0.5">Click to replace</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (onChange) onChange(undefined, undefined); }}
                className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center text-destructive hover:bg-destructive/30 transition-colors flex-shrink-0"
              >
                <X size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="flex flex-col items-center gap-2 py-6 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <User size={18} className="text-accent-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Upload Player Render</p>
                <p className="text-xs text-muted-foreground mt-0.5">PNG with transparency recommended</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Upload size={11} />
                <span>Click or drag & drop</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          onClick={(e) => (e.currentTarget.value = "")}
        />
      </div>
    </div>
  );
}
