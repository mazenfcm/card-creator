/*
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
import { useAssets } from "@/hooks/useAssets";

// ── Gallery assets — user will populate these from folders ──
const DEFAULT_BACKGROUNDS: GalleryAsset[] = [];
const DEFAULT_FLAGS: GalleryAsset[] = [];
const DEFAULT_LEAGUES: GalleryAsset[] = [];
const DEFAULT_CLUBS: GalleryAsset[] = [];

type ModalType = "background" | "flag" | "league" | "club" | null;

const POSITIONS = ["ST", "CF", "LW", "RW", "CAM", "CM", "CDM", "LM", "RM", "LB", "RB", "CB", "GK"];

// Default KANE card data
const DEFAULT_CARD_DATA: CardData = {
  name: "KANE",
  ovr: "119",
  position: "ST",
  playerType: "Live",
  nameColor: "#FFFFFF",
  ovrColor: "#FFFFFF",
  positionColor: "#FFFFFF",
  renderUrl: "/card-creator/assets/kane-default.png",
};

// localStorage keys
const STORAGE_KEYS = {
  cardData: "fc-card-creator-data",
  selectedBg: "fc-card-creator-bg",
  selectedFlag: "fc-card-creator-flag",
  selectedLeague: "fc-card-creator-league",
  selectedClub: "fc-card-creator-club",
  renderUrl: "fc-card-creator-render",
};

export default function Home() {
  // ── Card data state with localStorage ──
  const [cardData, setCardData] = useState<CardData>(() => {
    if (typeof window === "undefined") return DEFAULT_CARD_DATA;
    const saved = localStorage.getItem(STORAGE_KEYS.cardData);
    return saved ? JSON.parse(saved) : DEFAULT_CARD_DATA;
  });

  // ── Asset selections with localStorage ──
  const [selectedBg, setSelectedBg] = useState<GalleryAsset | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const saved = localStorage.getItem(STORAGE_KEYS.selectedBg);
    return saved ? JSON.parse(saved) : undefined;
  });

  const [selectedFlag, setSelectedFlag] = useState<GalleryAsset | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const saved = localStorage.getItem(STORAGE_KEYS.selectedFlag);
    return saved ? JSON.parse(saved) : undefined;
  });

  const [selectedLeague, setSelectedLeague] = useState<GalleryAsset | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const saved = localStorage.getItem(STORAGE_KEYS.selectedLeague);
    return saved ? JSON.parse(saved) : undefined;
  });

  const [selectedClub, setSelectedClub] = useState<GalleryAsset | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const saved = localStorage.getItem(STORAGE_KEYS.selectedClub);
    return saved ? JSON.parse(saved) : undefined;
  });

  const [renderUrl, setRenderUrl] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(STORAGE_KEYS.renderUrl) || undefined;
  });

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
  const { flags, leagues, clubs, backgrounds } = useAssets();

  // ── Save to localStorage whenever card data changes ──
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cardData, JSON.stringify(cardData));
  }, [cardData]);

  useEffect(() => {
    if (selectedBg) localStorage.setItem(STORAGE_KEYS.selectedBg, JSON.stringify(selectedBg));
    else localStorage.removeItem(STORAGE_KEYS.selectedBg);
  }, [selectedBg]);

  useEffect(() => {
    if (selectedFlag) localStorage.setItem(STORAGE_KEYS.selectedFlag, JSON.stringify(selectedFlag));
    else localStorage.removeItem(STORAGE_KEYS.selectedFlag);
  }, [selectedFlag]);

  useEffect(() => {
    if (selectedLeague) localStorage.setItem(STORAGE_KEYS.selectedLeague, JSON.stringify(selectedLeague));
    else localStorage.removeItem(STORAGE_KEYS.selectedLeague);
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedClub) localStorage.setItem(STORAGE_KEYS.selectedClub, JSON.stringify(selectedClub));
    else localStorage.removeItem(STORAGE_KEYS.selectedClub);
  }, [selectedClub]);

  useEffect(() => {
    if (renderUrl) localStorage.setItem(STORAGE_KEYS.renderUrl, renderUrl);
    else localStorage.removeItem(STORAGE_KEYS.renderUrl);
  }, [renderUrl]);

  // Sync loaded assets to gallery state and auto-select defaults
  useEffect(() => {
    if (flags.length > 0) {
      setFlagGallery(flags);
      // Auto-select England flag if not already selected
      if (!selectedFlag) {
        const englandFlag = flags.find(f => f.name?.includes("England"));
        if (englandFlag) {
          setSelectedFlag(englandFlag);
          localStorage.setItem(STORAGE_KEYS.selectedFlag, JSON.stringify(englandFlag));
        }
      }
    }
  }, [flags]);

  useEffect(() => {
    if (leagues.length > 0) {
      setLeagueGallery(leagues);
      // Auto-select Bundesliga if not already selected
      if (!selectedLeague) {
        const bundesliga = leagues.find(l => l.name?.includes("Bundesliga"));
        if (bundesliga) {
          setSelectedLeague(bundesliga);
          localStorage.setItem(STORAGE_KEYS.selectedLeague, JSON.stringify(bundesliga));
        }
      }
    }
  }, [leagues]);

  useEffect(() => {
    if (clubs.length > 0) {
      setClubGallery(clubs);
      // Auto-select Bayern Munich if not already selected
      if (!selectedClub) {
        const bayern = clubs.find(c => c.name?.includes("Bayern"));
        if (bayern) {
          setSelectedClub(bayern);
          localStorage.setItem(STORAGE_KEYS.selectedClub, JSON.stringify(bayern));
        }
      }
    }
  }, [clubs]);

  useEffect(() => {
    if (backgrounds.length > 0) {
      setBgGallery(backgrounds);
      // Auto-select TOTS26 LIVE background if not already selected
      if (!selectedBg) {
        const tots26 = backgrounds.find(b => b.name?.includes("TOTS26") && b.name?.includes("LIVE"));
        if (tots26) {
          setSelectedBg(tots26);
          localStorage.setItem(STORAGE_KEYS.selectedBg, JSON.stringify(tots26));
        }
      }
    }
  }, [backgrounds]);

  // Load background color presets from JSON
  useEffect(() => {
    const loadColorPresets = async () => {
      try {
        const response = await fetch("/card-creator/assets/background-colors.json");
        const data = await response.json();
        const bgColorMap = new Map();
        data.backgrounds.forEach((bg: any) => {
          bgColorMap.set(bg.name, {
            nameColor: bg.nameColor,
            posColor: bg.posColor,
            ovrColor: bg.ovrColor,
          });
        });
        (window as any).bgColorPresets = bgColorMap;
      } catch (error) {
        console.error("Failed to load background color presets:", error);
      }
    };
    loadColorPresets();
  }, []);

  // Sync selected assets into cardData and apply background colors
  useEffect(() => {
    const bgColors = (window as any).bgColorPresets?.get(selectedBg?.name);
    if (bgColors) {
      setCardData((prev) => ({
        ...prev,
        backgroundUrl: selectedBg?.url,
        nationUrl: selectedFlag?.url,
        leagueUrl: selectedLeague?.url,
        clubUrl: selectedClub?.url,
        renderUrl,
        nameColor: bgColors.nameColor,
        positionColor: bgColors.posColor,
        ovrColor: bgColors.ovrColor,
      }));
      console.log("Applied background colors:", bgColors);
    } else {
      setCardData((prev) => ({
        ...prev,
        backgroundUrl: selectedBg?.url,
        nationUrl: selectedFlag?.url,
        leagueUrl: selectedLeague?.url,
        clubUrl: selectedClub?.url,
        renderUrl,
      }));
    }
    triggerPulse();
  }, [selectedBg, selectedFlag, selectedLeague, selectedClub, renderUrl]);

  const triggerPulse = useCallback(() => {
    setCardPulse(true);
    setTimeout(() => setCardPulse(false), 400);
  }, []);

  const handleReset = useCallback(() => {
    setCardData(DEFAULT_CARD_DATA);
    setSelectedBg(undefined);
    setSelectedFlag(undefined);
    setSelectedLeague(undefined);
    setSelectedClub(undefined);
    setRenderUrl(undefined);
    localStorage.removeItem(STORAGE_KEYS.cardData);
    localStorage.removeItem(STORAGE_KEYS.selectedBg);
    localStorage.removeItem(STORAGE_KEYS.selectedFlag);
    localStorage.removeItem(STORAGE_KEYS.selectedLeague);
    localStorage.removeItem(STORAGE_KEYS.selectedClub);
    localStorage.removeItem(STORAGE_KEYS.renderUrl);
    toast.success("Card reset to defaults");
  }, []);

  const handleDownload = useCallback(async (size: number) => {
    if (!canvasRef.current) {
      toast.error("Canvas not ready");
      return;
    }

    try {
      const blob = await canvasRef.current.exportCanvas(size);
      if (!blob) {
        toast.error("Failed to export card");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fc-card-${size}x${size}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Card downloaded (${size}x${size})`);
    } catch (error) {
      toast.error("Download failed");
    }
  }, []);

  const handleAssetSelect = useCallback((asset: GalleryAsset, type: "background" | "flag" | "league" | "club") => {
    if (type === "background") {
      setSelectedBg(asset);
      localStorage.setItem(STORAGE_KEYS.selectedBg, JSON.stringify(asset));
    }
    if (type === "flag") {
      setSelectedFlag(asset);
      localStorage.setItem(STORAGE_KEYS.selectedFlag, JSON.stringify(asset));
    }
    if (type === "league") {
      setSelectedLeague(asset);
      localStorage.setItem(STORAGE_KEYS.selectedLeague, JSON.stringify(asset));
    }
    if (type === "club") {
      setSelectedClub(asset);
      localStorage.setItem(STORAGE_KEYS.selectedClub, JSON.stringify(asset));
    }
    setOpenModal(null);
  }, []);

  const handleRenderUpload = useCallback((url: string) => {
    setRenderUrl(url);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg sm:text-xl text-foreground">FC CARD CREATOR</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest">FC MOBILE EDITION</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-border text-foreground text-xs sm:text-sm font-display font-bold hover:bg-muted transition-colors"
            whileTap={{ scale: 0.96 }}
          >
            <RefreshCw size={14} />
            Reset
          </motion.button>
          <motion.button
            onClick={() => setDownloadOpen(true)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-purple-600 text-white text-xs sm:text-sm font-display font-bold hover:bg-purple-700 transition-colors"
            whileTap={{ scale: 0.96 }}
          >
            <Download size={14} />
            Download
          </motion.button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
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

          </div>
        </div>

        {/* ── Controls Panel: Bottom on Mobile / Right on Desktop ── */}
        <div className="w-full lg:w-[42%] xl:w-[38%] border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
          <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
            {/* ── Player Info Section ── */}
            <motion.div
              className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-purple-400" />
                <h2 className="section-label">PLAYER INFO</h2>
              </div>

              {/* Player Name */}
              <div>
                <label className="text-xs font-display font-bold text-purple-300 tracking-wider">PLAYER NAME</label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="PLAYER NAME"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* OVR & Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-display font-bold text-purple-300 tracking-wider">OVERALL (OVR)</label>
                  <input
                    type="number"
                    value={cardData.ovr}
                    onChange={(e) => setCardData((prev) => ({ ...prev, ovr: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-purple-300 tracking-wider">POSITION</label>
                  <input
                    type="text"
                    value={cardData.position}
                    onChange={(e) => setCardData((prev) => ({ ...prev, position: e.target.value.toUpperCase() }))}
                    placeholder="e.g., ST, CM, CB"
                    maxLength={3}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* ── Card Type Section ── */}
            <motion.div
              className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="text-xs font-display font-bold text-purple-300 tracking-wider block">CARD TYPE</label>
              <div className="flex gap-2">
                {(["Icon", "Live"] as const).map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => setCardData((prev) => ({ ...prev, playerType: type }))}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-display font-bold transition-all ${
                      cardData.playerType === type
                        ? "bg-purple-600 text-white"
                        : "bg-background border border-border text-foreground hover:border-purple-500"
                    }`}
                    whileTap={{ scale: 0.96 }}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* ── Text Colors Section ── */}
            <motion.div
              className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye size={14} className="text-purple-400" />
                <h3 className="section-label">TEXT COLORS</h3>
              </div>
              <ColorPickerField
                label="NAME COLOR"
                value={cardData.nameColor}
                onChange={(color) => setCardData((prev) => ({ ...prev, nameColor: color }))}
              />
              <ColorPickerField
                label="OVR COLOR"
                value={cardData.ovrColor}
                onChange={(color) => setCardData((prev) => ({ ...prev, ovrColor: color }))}
              />
              <ColorPickerField
                label="POSITION COLOR"
                value={cardData.positionColor}
                onChange={(color) => setCardData((prev) => ({ ...prev, positionColor: color }))}
              />
            </motion.div>

            {/* ── Card Assets Section ── */}
            <motion.div
              className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="section-label">CARD ASSETS</h3>

              {/* Player Render */}
              <div>
                <label className="text-xs font-display font-bold text-purple-300 tracking-wider block mb-2">PLAYER RENDER</label>
                <RenderUploadZone value={renderUrl} onChange={(url) => setRenderUrl(url)} onUpload={handleRenderUpload} />
              </div>

              {/* Background */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-display font-bold text-purple-300 tracking-wider">BACKGROUND</label>
                  {selectedBg && <span className="text-[10px] text-muted-foreground">{selectedBg.name}</span>}
                </div>
                <AssetPickerButton
                  label="Background"
                  selected={selectedBg}
                  onClick={() => setOpenModal("background")}
                />
              </div>

              {/* Flag */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-display font-bold text-purple-300 tracking-wider">FLAG</label>
                  {selectedFlag && <span className="text-[10px] text-muted-foreground">{selectedFlag.name}</span>}
                </div>
                <AssetPickerButton
                  label="Flag"
                  selected={selectedFlag}
                  onClick={() => setOpenModal("flag")}
                />
              </div>

              {/* League */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-display font-bold text-purple-300 tracking-wider">LEAGUE</label>
                  {selectedLeague && <span className="text-[10px] text-muted-foreground">{selectedLeague.name}</span>}
                </div>
                <AssetPickerButton
                  label="League"
                  selected={selectedLeague}
                  onClick={() => setOpenModal("league")}
                />
              </div>

              {/* Club */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-display font-bold text-purple-300 tracking-wider">CLUB</label>
                  {selectedClub && <span className="text-[10px] text-muted-foreground">{selectedClub.name}</span>}
                </div>
                <AssetPickerButton
                  label="Club"
                  selected={selectedClub}
                  onClick={() => setOpenModal("club")}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {openModal && (
          <AssetGalleryModal
            open={openModal !== null}
            onClose={() => setOpenModal(null)}
            title={`Select ${openModal.toUpperCase()}`}
            assets={
              openModal === "background"
                ? bgGallery
                : openModal === "flag"
                  ? flagGallery
                  : openModal === "league"
                    ? leagueGallery
                    : clubGallery
            }
            onSelect={(asset) => handleAssetSelect(asset, openModal)}
            onUpload={(asset) => {
              if (openModal === "background") setBgGallery(prev => [...prev, asset]);
              if (openModal === "flag") setFlagGallery(prev => [...prev, asset]);
              if (openModal === "league") setLeagueGallery(prev => [...prev, asset]);
              if (openModal === "club") setClubGallery(prev => [...prev, asset]);
              handleAssetSelect(asset, openModal);
            }}
          />
        )}
      </AnimatePresence>

      {downloadOpen && (
        <DownloadModal
          open={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          onDownload={handleDownload}
        />
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-border px-4 sm:px-6 py-3 sm:py-4 bg-background/50 flex items-center justify-between">
        <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wider">Created by <span className="font-display font-bold text-purple-400">MAZENFCM</span></p>
        <motion.button
          onClick={() => setDownloadOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-purple-600 text-white text-xs sm:text-sm font-display font-bold hover:bg-purple-700 transition-colors"
          whileTap={{ scale: 0.96 }}
        >
          <Download size={14} />
          Download
        </motion.button>
      </footer>
    </div>
  );
}
