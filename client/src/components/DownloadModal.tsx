/**
 * DownloadModal — Dark Cyber-Football theme
 * Lets the user pick download quality: 256, 512, or 1024.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Zap, Star, Crown } from "lucide-react";
import { useState } from "react";

const QUALITIES = [
  {
    size: 256,
    label: "256 × 256",
    tag: "Fast",
    desc: "Small file, quick share",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  {
    size: 512,
    label: "512 × 512",
    tag: "Balanced",
    desc: "Good quality, medium size",
    icon: Star,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  {
    size: 1024,
    label: "1024 × 1024",
    tag: "Max Quality",
    desc: "Full resolution, best detail",
    icon: Crown,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
  {
    size: 2048,
    label: "2048 × 2048",
    tag: "Ultra HD",
    desc: "Highest resolution, premium quality",
    icon: Crown,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
];

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: (size: number) => Promise<void>;
}

export default function DownloadModal({ open, onClose, onDownload }: DownloadModalProps) {
  const [selected, setSelected] = useState(1024);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await onDownload(selected);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="modal-backdrop absolute inset-0" />

          <motion.div
            className="relative w-full max-w-sm panel overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="section-label mb-0.5">Export Card</p>
                <h2 className="font-display text-base font-bold text-foreground">Choose Quality</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quality options */}
            <div className="px-5 py-4 space-y-2">
              {QUALITIES.map((q) => {
                const Icon = q.icon;
                const isSelected = selected === q.size;
                return (
                  <motion.button
                    key={q.size}
                    type="button"
                    onClick={() => setSelected(q.size)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? `${q.bg} border-opacity-100`
                        : "bg-muted/40 border-border hover:border-border/80 hover:bg-muted/60"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? q.bg : "bg-muted"}`}>
                      <Icon size={16} className={isSelected ? q.color : "text-muted-foreground"} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold font-display ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                          {q.label}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isSelected ? `${q.color} bg-current/10` : "text-muted-foreground bg-muted"}`}
                          style={isSelected ? { backgroundColor: "transparent", border: "1px solid currentColor" } : {}}>
                          {q.tag}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{q.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${isSelected ? "border-purple-500 bg-purple-500" : "border-border"}`}>
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Download button */}
            <div className="px-5 pb-5">
              <motion.button
                type="button"
                onClick={handleDownload}
                disabled={loading}
                className="w-full btn-glow btn-shimmer text-white font-display font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Download {selected}px Card
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
