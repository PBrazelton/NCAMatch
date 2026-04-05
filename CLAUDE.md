# NHS Match Program

## Design Context

### Users
High school sophomores (15-16) and seniors (17-18) at Nova Classical Academy, filling out a mentor/mentee matching form on their phones during school or at home. They're used to polished consumer apps (Duolingo, Instagram, TikTok) and have zero patience for clunky forms. The job: submit an interest profile that feels quick, personal, and maybe even fun — not like homework. A secondary user is the NHS admin team (students + advisor) reviewing matches on the dashboard.

### Brand Personality
**Bold, energetic, youthful.** This is a student site run by students for students. The Knight identity (swords, shields, gold/navy heraldry) is a source of pride, not stuffiness. The tone is peer-to-peer — like a message from a friend on the NHS team, not an institutional email. Confidence without formality.

### Aesthetic Direction
- **Visual tone:** Fun and energetic. Gamified, progress-driven UI inspired by Headspace (soft encouragement, milestone moments) and Duolingo (playful feedback, celebration of completion, chunked progress).
- **References:** Headspace — calming micro-interactions, friendly illustrations, chunked steps that feel achievable. Duolingo — satisfying progress indicators, celebratory moments, personality in every screen.
- **Knight identity:** Lean into the Nova Knight brand for visual flair — swords, shields, gold/navy palette. Use as motifs and accents, not corporate chrome.
- **Anti-references:** Google Forms. Boring school portals. Anything that feels like a spreadsheet or government form. No gray-on-gray institutional blandness.
- **Theme:** Burgundy gradient background (matching NCA school brand). Navy as secondary accent. White cards float above. Gold is the action/celebration color. Real knight helmet logo from novaknights.org.

### Color Palette
| Role | CSS Variable | Value | Usage |
|---|---|---|---|
| Burgundy | `--burgundy` | `#7a303f` | Background gradient, brand identity |
| Burgundy Dark | `--burgundy-dark` | `#5c2330` | Gradient endpoint |
| Burgundy Deep | `--burgundy-deep` | `#4a1a27` | Gradient start |
| Navy | `--navy` | `#18154a` | Headings, chip selected, secondary brand |
| Gold | `--gold` | `#f6b436` | CTAs, progress, celebration, accents |
| Gold Hover | `--gold-hover` | `#e5a025` | Button hover state |
| White | `--white` | `#ffffff` | Card backgrounds, primary text on dark |
| Slate 800 | `--slate-800` | `#1e293b` | Body text on white |
| Slate 600 | `--slate-600` | `#475569` | Labels, secondary text |
| Slate 400 | `--slate-400` | `#94a3b8` | Muted text, hints |
| Slate 200 | `--slate-200` | `#e2e8f0` | Borders, dividers |
| Warm Yellow BG | `--warm-bg` | `#fffbeb` | Selected state backgrounds, highlights |

### Typography
- **Headings:** Cormorant Garamond (serif, 600-700) — gives the Knight brand a touch of heraldic elegance
- **Body:** Plus Jakarta Sans (sans-serif, 400-800) — modern, geometric, highly readable on mobile
- **Scale:** 30px h1 / 26px h2 / 20px h3 / 14px body / 13px small / 12px labels / 10-11px captions

### Design Principles

1. **Progress is the reward.** Every interaction should feel like forward momentum. Chunked steps, animated progress bars, celebratory transitions. The form should feel like a game you're winning, not a chore you're completing.

2. **Personality in every pixel.** Emoji, playful copy, Knight-themed flair, micro-interactions — this isn't a corporate tool. Every screen should have at least one moment of delight or character.

3. **Mobile-native, not mobile-adapted.** Design for thumbs first. Touch targets are generous, scroll is minimal per step, and nothing requires precision tapping. 580px max-width, but the real target is 375px.

4. **Gold means go.** The gold accent is reserved for primary actions, progress, and celebration. It's the visual thread that pulls users forward through the form. Don't dilute it on passive elements.

5. **Accessible by default.** Keyboard navigable, screen-reader friendly, sufficient contrast. Fun doesn't mean exclusive. All interactive elements are proper buttons with ARIA attributes.
