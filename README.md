# NovaLoot Storefront

NovaLoot is a modern, single-page gaming storefront prototype that showcases interactive purchasing flows, scroll-driven reveals, and a rich testimonial carousel. The experience is built with semantic HTML, modern CSS, and vanilla JavaScript — no build tools required.

## Getting started

1. Clone or download this repository.
2. Open `index.html` in your preferred browser. All assets are local, so no additional setup is necessary.

## Features

- Sticky glassmorphism navigation with responsive drawer and cart indicators.
- Animated hero with gradient motion, sparkles, and smooth anchor buttons.
- Scroll-revealed “How it works” steps driven by `IntersectionObserver`.
- Interactive games grid with accessible tutorial modal and focus trapping.
- Persistent mini cart drawer powered by `localStorage`, including quantity badges and remove controls.
- Auto-playing testimonial carousel with pause-on-hover, touch swipes, and keyboard support.
- Dark / light theme toggle that respects `prefers-reduced-motion` and saves your choice.
- Session promo ribbon and bottom sticky offer with dismiss persistence.

## Test checklist

Use this checklist to verify the core interactions:

- [ ] Sticky nav remains visible and the mobile hamburger opens/closes the slide-in drawer (ESC and overlay close it).
- [ ] Hero “Start shopping” and “How it works” buttons scroll smoothly to their anchors.
- [ ] “How it works” cards fade/slide into view as you scroll (scroll-reveal active).
- [ ] Each game card’s “View tutorial” opens a modal that traps focus and closes via button, ESC, or overlay.
- [ ] Best sellers show exactly 3 products; Add to Cart populates the mini cart, remove buttons work, and counts persist after reload (localStorage).
- [ ] Bottom promo ribbon dismiss button hides the banner and stays dismissed after reload (localStorage).
- [ ] Dark mode toggle switches themes and remembers the setting across reloads.
- [ ] Testimonials carousel auto-plays every 4s, pauses on hover/focus, supports swipe, and prev/next buttons work with keyboard.

Enjoy exploring NovaLoot! 🎮
