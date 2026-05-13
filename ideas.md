# FC Mobile Card Creator — Design Ideas

<response>
<idea>
**Design Movement:** Dark Cyber-Football / Neon Brutalism
**Core Principles:**
- Deep obsidian background with electric purple/violet accents
- Sharp geometric shapes with glowing neon borders
- Bold display typography contrasted with clean UI text
- Card preview as the visual hero — everything else serves it

**Color Philosophy:**
- Background: #0A0A0F (near-black with a hint of blue)
- Surface: #12121A
- Accent: #7C3AED (violet-600) → #A855F7 (purple-500) gradient
- Glow: rgba(124, 58, 237, 0.4) for shadows
- Text: #F0F0FF (slightly cool white)

**Layout Paradigm:**
- Asymmetric split: left panel = controls (40%), right panel = live card preview (60%)
- Controls stacked vertically with section dividers
- Preview floats with subtle glow shadow

**Signature Elements:**
- Glowing purple border on focused inputs
- Neon shimmer animation on card preview
- Frosted glass modals for asset pickers

**Interaction Philosophy:**
- Every button press has a scale(0.97) tactile response
- Modals slide in from bottom with spring physics
- Asset grid items pop on hover with purple glow

**Animation:**
- Button hover: translateY(-2px) + glow intensify (150ms ease-out)
- Modal open: scale(0.95)→1 + opacity 0→1 (220ms cubic-bezier(0.23,1,0.32,1))
- Card preview update: subtle pulse flash (200ms)
- Download button: shimmer sweep animation

**Typography System:**
- Display: Orbitron (futuristic, bold) for headings and card labels
- Body: Inter (clean, readable) for form labels and UI text
- Mono: JetBrains Mono for hex color inputs
</idea>
<probability>0.08</probability>
</response>

**Selected: Dark Cyber-Football / Neon Brutalism**
