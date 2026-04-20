
---

**Antigravity Prompt — MangoWala:**

> Build **MangoWala** — premium mango D2C store. Mobile-first. React + Tailwind.
>
> **Colors:** Orange `#FF6B00`, Yellow `#FFD700`, Off-white `#FFF8F0`, Dark `#1A1A1A`. Add `color-scheme: light` on `<html>`. Set `<meta name="theme-color" content="#FF6B00">`.
>
> **Sections:**
>
> 1. **Hero** — full-bleed banner, mango image with `width`+`height`+`fetchpriority="high"`, tagline, `<a href="#shop">` CTA button labeled "Shop Mangoes" (not "Click Here")
> 2. **Product Grid** — Alphonso, Kesar, Dasheri, Langra cards. Each: `<img>` with `alt`, `width`, `height`, `loading="lazy"`. "Add to Cart" uses `<button>` (not div). Hover state on button increases contrast.
> 3. **Cart Drawer** — slide-in, `overscroll-behavior: contain`, closes on Escape key (`onKeyDown`). Qty controls are `<button>` with `aria-label="Increase quantity"`. Show `"Saving…"` with ellipsis during update.
> 4. **Checkout Form** — all inputs have `<label htmlFor>`. Use `type="tel"` for phone, `type="text" inputmode="numeric"` for pincode, `autocomplete="name"/"tel"/"street-address"/"postal-code"`. Never block paste. Inline errors with `aria-live="polite"`. Submit button disabled after click, shows `"Placing order…"`. Warn on back navigation if form dirty.
> 5. **Footer** — `<nav>` with `<a>` links. Instagram icon button needs `aria-label="Instagram"` + `aria-hidden="true"` on icon SVG.
>
> **Animations:** `transform`/`opacity` only. Add `prefers-reduced-motion` variant. No `transition: all`.
>
> **Typography:** Use `…` not `...`. `text-wrap: balance` on all headings. `touch-action: manipulation` on all buttons.
>
> **All interactive elements:** visible `focus-visible:ring-2` ring. No `outline-none` without replacement.
>
> **Supabase:** connect for `products` + `orders` tables. On order submit → write to `orders`. Show optimistic UI update, reconcile on response.
>
> **Deploy:** Vercel.

---

