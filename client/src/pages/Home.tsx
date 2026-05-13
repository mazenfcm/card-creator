/**
 * Home — FC Mobile Card Creator
 * Design: Dark Cyber-Football / Neon Brutalism
 * Layout: Asymmetric split — left controls (42%) / right live preview (58%)
 * Colors: Deep obsidian bg, electric purple/violet accents, Orbitron display font
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Download,
  RefreshCw,
  Layers,
  ChevronDown,
  Sparkles,
  Eye,
} from "lucide-react";

import CardCanvas, { type CardData, type CardCanvasHandle } from "@/components/CardCanvas";
import AssetGalleryModal, { type GalleryAsset } from "@/components/AssetGalleryModal";
import AssetPickerButton from "@/components/AssetPickerButton";
import ColorPickerField from "@/components/ColorPickerField";
import RenderUploadZone from "@/components/RenderUploadZone";
import DownloadModal from "@/components/DownloadModal";

// ── Gallery assets — user will populate these from folders ──
const DEFAULT_BACKGROUNDS: GalleryAsset[] = [];
const DEFAULT_FLAGS: GalleryAsset[] = [];
const DEFAULT_LEAGUES: GalleryAsset[] = [];
const DEFAULT_CLUBS: GalleryAsset[] = [];

type ModalType = "background" | "flag" | "league" | "club" | null;

const POSITIONS = ["ST", "CF", "LW", "RW", "CAM", "CM", "CDM", "LM", "RM", "LB", "RB", "CB", "GK"];

export default function Home() {
  // Load flags from /public/assets/flags on mount
  useEffect(() => {
    const loadFlags = async () => {
      try {
        // Dynamically import all PNG files from assets/flags
        const flagFiles = import.meta.glob('/public/assets/flags/*.png', { eager: true });
        const flags = Object.keys(flagFiles)
          .map(path => {
            const filename = path.split('/').pop() || '';
            return {
              id: filename,
              name: filename.replace('.png', ''),
              url: `/assets/flags/${filename}`,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        
        if (flags.length > 0) {
          setFlagGallery(flags);
        }
      } catch (error) {
        console.log('Flags loading: manual upload available');
      }
    };
    loadFlags();
  }, []);

  // ── Card data state ──
  const [cardData, setCardData] = useState<CardData>({
    name: "PLAYER NAME",
    ovr: "99",
    position: "ST",
    playerType: "Live",
    nameColor: "#FFFFFF",
    ovrColor: "#FFFFFF",
    positionColor: "#FFFFFF",
  });

  // ── Asset selections ──
  const [selectedBg, setSelectedBg] = useState<GalleryAsset | undefined>();
  const [selectedFlag, setSelectedFlag] = useState<GalleryAsset | undefined>();
  const [selectedLeague, setSelectedLeague] = useState<GalleryAsset | undefined>();
  const [selectedClub, setSelectedClub] = useState<GalleryAsset | undefined>();
  const [renderUrl, setRenderUrl] = useState<string | undefined>();

  // ── Gallery state ──
  const [bgGallery, setBgGallery] = useState<GalleryAsset[]>(DEFAULT_BACKGROUNDS);
  const [flagGallery, setFlagGallery] = useState<GalleryAsset[]>(DEFAULT_FLAGS);
  const [leagueGallery, setLeagueGallery] = useState<GalleryAsset[]>(DEFAULT_LEAGUES);
  const [clubGallery, setClubGallery] = useState<GalleryAsset[]>(DEFAULT_CLUBS);

  // ── Modal state ──
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [cardPulse, setCardPulse] = useState(false);

  const canvasRef = useRef<CardCanvasHandle>(null);

  // Sync selected assets into cardData
  useEffect(() => {
    setCardData((prev) => ({
      ...prev,
      backgroundUrl: selectedBg?.url,
      nationUrl: selectedFlag?.url,
      leagueUrl: selectedLeague?.url,
      clubUrl: selectedClub?.url,
      renderUrl,
    }));
    triggerPulse();
  }, [selectedBg, selectedFlag, selectedLeague, selectedClub, renderUrl]);

  const triggerPulse = () => {
    setCardPulse(true);
    setTimeout(() => setCardPulse(false), 300);
  };

  const updateCard = useCallback(<K extends keyof CardData>(key: K, value: CardData[K]) => {
    setCardData((prev) => ({ ...prev, [key]: value }));
    triggerPulse();
  }, []);

  const handleDownload = async (size: number) => {
    const blob = await canvasRef.current?.exportCanvas(size);
    if (!blob) {
      toast.error("Failed to export card");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cardData.name || "card"}_${size}x${size}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Card downloaded at ${size}×${size}!`);
  };

  const handleReset = () => {
    setCardData({
      name: "PLAYER NAME",
      ovr: "99",
      position: "ST",
      playerType: "Live",
      nameColor: "#FFFFFF",
      ovrColor: "#FFFFFF",
      positionColor: "#FFFFFF",
    });
    setSelectedBg(undefined);
    setSelectedFlag(undefined);
    setSelectedLeague(undefined);
    setSelectedClub(undefined);
    setRenderUrl(undefined);
    toast.info("Card reset");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-lg" style={{ boxShadow: "0 0 16px rgba(124,58,237,0.5)" }}>
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold text-foreground leading-none">FC CARD CREATOR</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono-custom tracking-wider">FC MOBILE EDITION</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent text-xs font-medium transition-all duration-150"
            whileTap={{ scale: 0.96 }}
          >
            <RefreshCw size={12} />
            Reset
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setDownloadOpen(true)}
            className="btn-glow flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-display font-bold transition-colors duration-150"
            whileTap={{ scale: 0.96 }}
          >
            <Download size={12} />
            Download
          </motion.button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-col-reverse lg:flex-row flex-1 overflow-hidden">
        {/* ── Controls Panel: Bottom on Mobile / Right on Desktop ── */}
        <div className="w-full lg:w-[42%] xl:w-[38%] border-t lg:border-t-0 lg:border-r border-border overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Player Info */}
            <section className="panel p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Layers size={13} className="text-purple-400" />
                <span className="section-label">Player Info</span>
              </div>
              <div className="neon-divider mb-3" />

              {/* Name */}
              <div>
                <label className="section-label block mb-1.5">Player Name</label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => updateCard("name", e.target.value)}
                  placeholder="Enter player name"
                  maxLength={20}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground input-glow font-display uppercase tracking-wider"
                />
              </div>

              {/* OVR + Position row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-1.5">Overall (OVR)</label>
                  <input
                    type="text"
                    value={cardData.ovr}
                    onChange={(e) => updateCard("ovr", e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="99"
                    maxLength={3}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground input-glow font-display text-center text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Position</label>
                  <div className="relative">
                    <select
                      value={cardData.position}
                      onChange={(e) => updateCard("position", e.target.value)}
                      className="w-full appearance-none bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground input-glow font-display font-bold pr-8"
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Player Type */}
              <div>
                <label className="section-label block mb-1.5">Card Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Icon", "Live"] as const).map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => updateCard("playerType", type)}
                      className={`py-2.5 rounded-lg text-sm font-display font-bold transition-all duration-150 border ${
                        cardData.playerType === type
                          ? "bg-purple-700/30 border-purple-500/60 text-purple-300"
                          : "bg-muted border-border text-muted-foreground hover:border-border/80"
                      }`}
                      whileTap={{ scale: 0.97 }}
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>
            </section>

            {/* Text Colors */}
            <section className="panel p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                <span className="section-label">Text Colors</span>
              </div>
              <div className="neon-divider mb-3" />
              <ColorPickerField
                label="Name Color"
                value={cardData.nameColor}
                onChange={(v) => updateCard("nameColor", v)}
              />
              <ColorPickerField
                label="OVR Color"
                value={cardData.ovrColor}
                onChange={(v) => updateCard("ovrColor", v)}
              />
              <ColorPickerField
                label="Position Color"
                value={cardData.positionColor}
                onChange={(v) => updateCard("positionColor", v)}
              />
            </section>

            {/* Card Assets */}
            <section className="panel p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Eye size={13} className="text-purple-400" />
                <span className="section-label">Card Assets</span>
              </div>
              <div className="neon-divider mb-3" />

              <AssetPickerButton
                label="Card Background"
                selected={selectedBg}
                onClick={() => setOpenModal("background")}
                placeholder="Upload or choose background"
              />

              <RenderUploadZone
                value={renderUrl}
                onChange={(url) => setRenderUrl(url)}
              />

              <AssetPickerButton
                label="Nation Flag"
                selected={selectedFlag}
                onClick={() => setOpenModal("flag")}
                placeholder="Upload or choose flag"
              />

              <AssetPickerButton
                label="League Logo"
                selected={selectedLeague}
                onClick={() => setOpenModal("league")}
                placeholder="Upload or choose league"
              />

              {cardData.playerType === "Live" && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AssetPickerButton
                      label="Club Logo"
                      selected={selectedClub}
                      onClick={() => setOpenModal("club")}
                      placeholder="Upload or choose club"
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </section>

            {/* Download CTA (bottom of controls) */}
            <motion.button
              type="button"
              onClick={() => setDownloadOpen(true)}
              className="btn-glow btn-shimmer w-full py-3.5 rounded-xl text-white font-display font-bold text-sm flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <Download size={15} />
              Export Card
            </motion.button>
          </div>
        </div>

        {/* ── Preview Panel: Top on Mobile / Left on Desktop ── */}
        <div className="w-full lg:w-[58%] flex flex-col items-center justify-center bg-background relative overflow-hidden border-b lg:border-b-0 lg:border-r border-border">
          {/* Background grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(oklch(0.55 0.22 290) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.55 0.22 290) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Radial glow center */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8 w-full">
            {/* Preview label */}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="section-label">Live Preview</span>
            </div>

            {/* Card canvas */}
            <motion.div
              className={`card-preview-glow rounded-2xl overflow-hidden ${cardPulse ? "card-pulse" : ""}`}
              style={{ width: "min(360px, 80vw)", height: "min(360px, 80vw)" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <CardCanvas
                ref={canvasRef}
                data={cardData}
                className="w-full h-full"
                style={{ display: "block" }}
              />
            </motion.div>

            {/* Quick stats */}
            <div className="flex items-center gap-3 sm:gap-6 text-center flex-wrap justify-center">
              <div>
                <p className="font-display text-xl sm:text-2xl font-black text-purple-400">{cardData.ovr || "—"}</p>
                <p className="text-[10px] text-muted-foreground tracking-wider">OVR</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div>
                <p className="font-display text-base sm:text-lg font-bold text-foreground">{cardData.position || "—"}</p>
                <p className="text-[10px] text-muted-foreground tracking-wider">POS</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div>
                <p className="font-display text-xs sm:text-sm font-bold text-foreground truncate max-w-[80px] sm:max-w-[100px]">{cardData.name || "—"}</p>
                <p className="text-[10px] text-muted-foreground tracking-wider">NAME</p>
              </div>
            </div>

            {/* Download shortcut */}
            <motion.button
              type="button"
              onClick={() => setDownloadOpen(true)}
              className="btn-glow flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-purple-700/20 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-display font-bold hover:bg-purple-700/30 transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              <Download size={14} />
              Download Card
            </motion.button>
          </div>
        </div>

        {/* ── Old Mobile Preview (hidden) ── */}
        <div className="hidden lg:hidden fixed bottom-0 inset-x-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-purple-500/30 flex-shrink-0">
            <CardCanvas
              data={cardData}
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-bold text-foreground truncate">{cardData.name || "Card Preview"}</p>
            <p className="text-xs text-muted-foreground">{cardData.ovr} OVR · {cardData.position}</p>
          </div>
          <motion.button
            type="button"
            onClick={() => setDownloadOpen(true)}
            className="btn-glow flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-700 text-white text-xs font-display font-bold"
            whileTap={{ scale: 0.96 }}
          >
            <Download size={12} />
            Export
          </motion.button>
        </div>
      </div>

      {/* ── Gallery Modals ── */}
      <AssetGalleryModal
        open={openModal === "background"}
        onClose={() => setOpenModal(null)}
        title="Card Backgrounds"
        assets={bgGallery}
        selectedId={selectedBg?.id}
        onSelect={(a) => { setSelectedBg(a); setOpenModal(null); }}
        onUpload={(a) => setBgGallery((prev) => [a, ...prev])}
      />
      <AssetGalleryModal
        open={openModal === "flag"}
        onClose={() => setOpenModal(null)}
        title="Nation Flags"
        assets={flagGallery}
        selectedId={selectedFlag?.id}
        onSelect={(a) => { setSelectedFlag(a); setOpenModal(null); }}
        onUpload={(a) => setFlagGallery((prev) => [a, ...prev])}
      />
      <AssetGalleryModal
        open={openModal === "league"}
        onClose={() => setOpenModal(null)}
        title="League Logos"
        assets={leagueGallery}
        selectedId={selectedLeague?.id}
        onSelect={(a) => { setSelectedLeague(a); setOpenModal(null); }}
        onUpload={(a) => setLeagueGallery((prev) => [a, ...prev])}
      />
      <AssetGalleryModal
        open={openModal === "club"}
        onClose={() => setOpenModal(null)}
        title="Club Logos"
        assets={clubGallery}
        selectedId={selectedClub?.id}
        onSelect={(a) => { setSelectedClub(a); setOpenModal(null); }}
        onUpload={(a) => setClubGallery((prev) => [a, ...prev])}
      />

      {/* ── Download Modal ── */}
      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        onDownload={handleDownload}
      />
    </div>
  );
}
