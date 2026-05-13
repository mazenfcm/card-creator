/**
 * AssetPickerButton — Dark Cyber-Football theme
 * Compact button that shows selected asset thumbnail and opens gallery modal.
 */
import { motion } from "framer-motion";
import { ImageIcon, ChevronRight } from "lucide-react";
import type { GalleryAsset } from "./AssetGalleryModal";

interface AssetPickerButtonProps {
  label: string;
  selected?: GalleryAsset;
  onClick: () => void;
  placeholder?: string;
}

export default function AssetPickerButton({
  label,
  selected,
  onClick,
  placeholder = "Choose from gallery",
}: AssetPickerButtonProps) {
  return (
    <div>
      <label className="section-label block mb-1.5">{label}</label>
      <motion.button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 bg-input border border-border rounded-lg px-3 py-2.5 hover:border-purple-600/60 hover:bg-accent transition-all duration-150 group"
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
          {selected ? (
            <img src={selected.url} alt={selected.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={16} className="text-muted-foreground" />
          )}
        </div>

        {/* Name */}
        <div className="flex-1 text-left min-w-0">
          {selected ? (
            <>
              <p className="text-sm font-medium text-foreground truncate">{selected.name}</p>
              <p className="text-xs text-muted-foreground">Tap to change</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{placeholder}</p>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight
          size={14}
          className="text-muted-foreground group-hover:text-purple-400 transition-colors flex-shrink-0"
        />
      </motion.button>
    </div>
  );
}
