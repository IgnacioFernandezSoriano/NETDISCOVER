# NetDiscover Design System
## Inspired by UPU — Institutional Modern

### Visual DNA Extracted from UPU
- **Primary Blue**: Deep navy #003087 (UPU institutional dark blue)
- **Accent Cyan**: #00AEEF (UPU bright cyan/sky blue — used in headers, CTAs)
- **Green accent**: #78BE20 (UPU lime green — used for positive indicators)
- **White background**: Clean, spacious layout
- **Typography**: Bold uppercase for headings (condensed weight), clean sans-serif for body

### NetDiscover Design Decisions
- **Modernize**: Replace heavy borders with subtle shadows and glass-morphism cards
- **Keep authority**: Deep navy as primary brand color
- **Add data-forward feel**: Cyan gradients for data visualization sections
- **Institutional trust**: Clean grid, generous whitespace, no decorative clutter

### Color Palette (OKLCH for Tailwind 4)
```css
--color-brand-navy: oklch(0.22 0.08 255);       /* #003087 deep navy */
--color-brand-cyan: oklch(0.68 0.17 220);        /* #00AEEF UPU cyan */
--color-brand-green: oklch(0.73 0.18 130);       /* #78BE20 UPU green */
--color-brand-light: oklch(0.97 0.01 255);       /* #F0F4FF light blue-white */
--color-brand-slate: oklch(0.45 0.05 255);       /* #4A5568 text secondary */
```

### Typography
- **Headings**: Inter (700/800) — modern, clean, institutional
- **Body**: Inter (400/500) — readable, neutral
- **Data/Numbers**: Inter Mono or tabular nums

### Component Language
- Cards: white bg, subtle shadow (0 2px 12px rgba(0,48,135,0.08)), 8px radius
- Buttons: primary = navy fill; secondary = cyan fill; ghost = navy outline
- Navigation: top bar with navy bg, white text, cyan hover underline
- Phase badges: colored pills matching phase color
- Progress bars: cyan fill on light gray track
- Charts: navy + cyan + green palette

### Layout Principles
- Max content width: 1280px
- Sidebar navigation for authenticated users (dashboard)
- Top navigation for public pages (landing)
- 8px grid spacing system
- Section dividers: subtle gray lines, no heavy borders
