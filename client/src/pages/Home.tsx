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

// ── Gallery assets — user will populate these from folders ──
const DEFAULT_BACKGROUNDS: GalleryAsset[] = [];
const DEFAULT_FLAGS: GalleryAsset[] = [];
const DEFAULT_LEAGUES: GalleryAsset[] = [];
const DEFAULT_CLUBS: GalleryAsset[] = [];

type ModalType = "background" | "flag" | "league" | "club" | null;

const POSITIONS = ["ST", "CF", "LW", "RW", "CAM", "CM", "CDM", "LM", "RM", "LB", "RB", "CB", "GK"];

export default function Home() {
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

  // Load flags from /public/assets/flags on mount
  useEffect(() => {
    const loadFlags = async () => {
      try {
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

  // Load leagues from /public/assets/leagues on mount
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const leagueFiles = import.meta.glob('/public/assets/leagues/*.png', { eager: true });
        const leagues = Object.keys(leagueFiles)
          .map(path => {
            const filename = path.split('/').pop() || '';
            return {
              id: filename,
              name: filename.replace('.png', ''),
              url: `/assets/leagues/${filename}`,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        
        if (leagues.length > 0) {
          setLeagueGallery(leagues);
        }
      } catch (error) {
        console.log('Leagues loading: manual upload available');
      }
    };
    loadLeagues();
  }, []);

  // Load clubs from /public/assets/clubs on mount
  useEffect(() => {
    const loadClubs = async () => {
      try {
        const clubFiles = import.meta.glob('/public/assets/clubs/*.png', { eager: true });
        const clubs = Object.keys(clubFiles)
          .map(path => {
            const filename = path.split('/').pop() || '';
            return {
              id: filename,
              name: filename.replace('.png', ''),
              url: `/assets/clubs/${filename}`,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        
        if (clubs.length > 0) {
          setClubGallery(clubs);
        }
      } catch (error) {
        console.log('Clubs loading: manual upload available');
      }
    };
    loadClubs();
  }, []);

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

  const triggerPulse = useCallback(() => {
    setCardPulse(true);
    setTimeout(() => setCardPulse(false), 400);
  }, []);

  const handleReset = useCallback(() => {
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

          {/* Footer with download button and credit */}
          <div className="p-4 sm:p-6 border-t border-border flex flex-col gap-3">
            <motion.button
              type="button"
              onClick={() => setDownloadOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 text-white font-display font-bold hover:bg-purple-700 transition-colors"
              whileTap={{ scale: 0.96 }}
            >
              <Download size={16} />
              Download Card
            </motion.button>
            <p className="text-center text-xs text-muted-foreground tracking-widest">CREATED BY MAZENFCM</p>
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
                    min="1"
                    max="99"
                    value={cardData.ovr}
                    onChange={(e) => setCardData((prev) => ({ ...prev, ovr: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-purple-300 tracking-wider">POSITION</label>
                  <select
                    value={cardData.position}
                    onChange={(e) => setCardData((prev) => ({ ...prev, position: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Card Type */}
              <div>
                <label className="text-xs font-display font-bold text-purple-300 tracking-wider">CARD TYPE</label>
                <div className="flex gap-2 mt-2">
                  {["Icon", "Live"].map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => setCardData((prev) => ({ ...prev, playerType: type as "Icon" | "Live" }))}
                      className={`flex-1 py-2 rounded-lg font-display font-bold text-sm transition-all ${
                        cardData.playerType === type
                          ? "bg-purple-600 text-white border border-purple-500"
                          : "bg-background border border-border text-foreground hover:border-purple-500/50"
                      }`}
                      whileTap={{ scale: 0.96 }}
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Text Colors Section ── */}
            <motion.div
              className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-purple-400" />
                <h2 className="section-label">TEXT COLORS</h2>
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

            {/* ── Assets Section ── */}
            <motion.div
              className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="section-label">CARD ASSETS</h2>

              <RenderUploadZone onUpload={(url) => setRenderUrl(url)} />

              <div className="grid grid-cols-2 gap-2">
                <AssetPickerButton
                  label="Background"
                  selected={selectedBg}
                  onClick={() => setOpenModal("background")}
                />
                <AssetPickerButton
                  label="Flag"
                  selected={selectedFlag}
                  onClick={() => setOpenModal("flag")}
                />
                <AssetPickerButton
                  label="League"
                  selected={selectedLeague}
                  onClick={() => setOpenModal("league")}
                />
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
        title="Leagues"
        assets={leagueGallery}
        selectedId={selectedLeague?.id}
        onSelect={(a) => { setSelectedLeague(a); setOpenModal(null); }}
        onUpload={(a) => setLeagueGallery((prev) => [a, ...prev])}
      />
      <AssetGalleryModal
        open={openModal === "club"}
        onClose={() => setOpenModal(null)}
        title="Clubs"
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
