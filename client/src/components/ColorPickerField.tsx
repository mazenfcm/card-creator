/**
 * ColorPickerField — Dark Cyber-Football theme
 * Hex color input with preset swatches for FC card text colors.
 */
import { useRef } from "react";

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export default function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
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

      </div>
    </div>
  );
}
