@AGENTS.md

# Daily Dose — Project Guide

Personal daily companion app for Zander. Next.js App Router + Supabase + Tailwind CSS, deployed on Vercel.

## Stack

- **Framework**: Next.js App Router — all data-fetching pages use `export const dynamic = 'force-dynamic'`
- **Auth + DB**: Supabase (RLS enabled); client via `@/lib/supabase/client` or `@/lib/supabase/server`
- **Styling**: Tailwind CSS + inline styles for the design token colors
- **Fonts**: Fraunces (headings, `var(--font-fraunces)`) + Plus Jakarta Sans (body, `var(--font-jakarta)`)
- **Timezone**: All `today` dates use `{ timeZone: 'America/New_York' }` — keep this consistent everywhere

## Design Tokens

```
Background:  #FAF8F5
Surface:     #FFFFFF
Border:      #E8E4DF
Text:        #2D2A26
Muted text:  #8B857D
Sage green:  #7C8B6F  (primary action)
Dark sage:   #5B6B4F  (submit buttons)
Amber:       #C4956A  (secondary / energy)
Warm amber:  #B8956A  (tech accent)
```

## Architecture Notes

- `/` — server component fetches today's briefing + debrief, passes as props to `HomeClient`
- `/debrief` — server component fetches today's debrief as `existing`; `DebriefClient` does INSERT if null, UPDATE if existing
- `debriefs.date` has a `UNIQUE` constraint — one record per day, always store with `today` from the server prop
- Briefings are generated via `/api/generate-briefing` (POST) and by a cron job at 6 AM ET

---

## Web Interface Guidelines

Findings from a full audit. Fix these before shipping new UI.

### Accessibility

- **Range input labels not associated**: `SliderField` in `DebriefClient.tsx` renders a `<label>` and `<input type="range">` without matching `htmlFor`/`id`. Add `id` to each input and `htmlFor` on the label.
- **Sign-out button missing `aria-label`**: `Nav.tsx:64` — `<button onClick={handleSignOut}>` has visual icon + "Out" text but should have `aria-label="Sign out"` for screen readers.
- **`outline: none` on range inputs**: `globals.css:87` — `input[type='range']:focus { outline: none }` removes the focus ring with no replacement. Replace with a `:focus-visible` rule that shows a visible indicator.
- **Textareas use outline-none + JS border hack**: `DebriefClient.tsx` textareas have `className="... outline-none"` and `onFocus/onBlur` inline style changes. Use CSS `:focus-visible` instead so keyboard users get a proper indicator.
- **Exercise duration input missing `autocomplete`**: `DebriefClient.tsx:372` — `<input type="number">` should have `autoComplete="off"` explicitly set.

### Animation

- **No `prefers-reduced-motion` override**: `globals.css:37-54` — `fadeIn` and `shimmer` keyframes animate unconditionally. Wrap in `@media (prefers-reduced-motion: no-preference)` or add a `prefers-reduced-motion: reduce` block that disables them.

  ```css
  @media (prefers-reduced-motion: reduce) {
    .animate-fade-in,
    .animate-fade-in-1,
    .animate-fade-in-2,
    .animate-fade-in-3,
    .animate-fade-in-4,
    .animate-fade-in-5,
    .animate-fade-in-6 { animation: none; }
    .skeleton { animation: none; }
  }
  ```

- **`transition-all` used on interactive elements**: `DebriefClient.tsx` Bristol picker buttons and checklist pill buttons use Tailwind's `transition-all`. Replace with `transition-colors` to avoid animating layout properties.

### Typography

- **Headings missing `text-wrap: balance`**: Add to `globals.css` under the `h1, h2, h3, h4, h5, h6` rule:

  ```css
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-fraunces), 'Lora', serif;
    text-wrap: balance;
  }
  ```

- **Placeholder ellipsis**: All placeholders use ASCII `...` — use the Unicode ellipsis `…` character instead (e.g., `"What are you grateful for today…"`).

### Content / Robustness

- **AI content has no truncation guard**: `BriefingCard.tsx` renders `content.markets.summary`, `content.tech_ai.summary`, etc. directly. If the model returns unusually long text, layout can break. Add `line-clamp` or length guards on summary fields.

### i18n / Locale

- **Hardcoded `'en-US'` locale**: `BriefingCard.tsx:44` and `HomeClient.tsx:19` use `toLocaleTimeString('en-US', ...)` / `toLocaleDateString('en-US', ...)`. This is acceptable for a single-user personal app, but if ever generalizing, switch to `Intl` APIs and detect locale from request headers.

---

## Conventions

- Keep all date/time computations on the server using the ET timezone constant — never derive `today` on the client
- Use `router.refresh()` (not full navigation) to re-sync server data after mutations where possible
- Match the existing card pattern: `background: #FFFFFF`, `borderRadius: '16px'`, `border: '1px solid #E8E4DF'`, `boxShadow: '0 1px 3px rgba(45,42,38,0.06)'`
- Section headers: `text-xs font-semibold uppercase tracking-widest` in `#8B857D`
- Primary action buttons: `backgroundColor: '#7C8B6F'`, `color: '#FFFFFF'`, `borderRadius: '12px'`
- Submit buttons: `backgroundColor: '#5B6B4F'`
