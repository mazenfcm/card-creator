/**
 * ColorPickerField — Dark Cyber-Football theme
 * Hex color input with preset swatches for FC card text colors.
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const PRESETS: { name: string; value: string }[] = [
  { name: "Normal White", value: "#FFFFFF" },
  { name: "TOTW Yellow", value: "#FCEB9F" },
  { name: "Ballon D'Or Cream", value: "#FFFFCD" },
  { name: "Captains Brown", value: "#513D03" },
  { name: "Captains Yellow", value: "#FFFF6C" },
  { name: "Grassroots Green", value: "#1B4C23" },
  { name: "Inferno Red", value: "#580A09" },
  { name: "Aqua Blue", value: "#152762" },
  { name: "UTOTS Brown", value: "#3E371B" },
  { name: "Anniversary Brown", value: "#513D03" },
];

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export default function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const nativeRef = useRef<HTMLInputElement>(null);

  const handleHexInput = (raw: string) => {
    const cleaned = raw.startsWith("#") ? raw : "#" + raw;
    onChange(cleaned);
  };

  return (
    <div className="relative">
      <label className="section-label block mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        {/* Color swatch / native picker trigger */}
        <button
          type="button"
          className="color-swatch active flex-shrink-0 relative overflow-hidden"
          style={{ background: value }}
          onClick={() => nativeRef.current?.click()}
          title="Pick color"
        >
          <input
            ref={nativeRef}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </button>

        {/* Hex text input */}
        <input
          type="text"
          value={value}
          onChange={(e) => handleHexInput(e.target.value)}
          maxLength={7}
          placeholder="#FFFFFF"
          className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground input-glow hex-input"
        />

        {/* Presets dropdown toggle */}
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground hover:bg-accent/80 transition-colors flex-shrink-0"
          title="Preset colors"
        >
          <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Presets dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-30 top-full mt-2 left-0 right-0 panel p-3 shadow-xl"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="section-label mb-2">Preset Colors</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value + preset.name}
                  type="button"
                  title={preset.name}
                  className={`color-swatch ${value.toUpperCase() === preset.value.toUpperCase() ? "active" : ""}`}
                  style={{ background: preset.value }}
                  onClick={() => { onChange(preset.value); setOpen(false); }}
                />
              ))}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => { onChange(preset.value); setOpen(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-left"
                >
                  <span
                    className="w-4 h-4 rounded-sm flex-shrink-0 border border-white/10"
                    style={{ background: preset.value }}
                  />
                  <span className="text-xs text-foreground">{preset.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground font-mono">{preset.value}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
