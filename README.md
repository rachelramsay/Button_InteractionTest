# Button_InteractionTest

A dependency-free playground for tuning one button's hover animation. Two
effects run together on a single button, with every parameter of both exposed
as live controls.

Open `index.html` in a browser. No build step, no install, no dependencies.

## The two layers

| Layer | Effect | Knobs |
| --- | --- | --- |
| **01 Shine** | A skewed light band sweeps across the button | band width, start offset, travel, skew, duration, delay, intensity, tint |
| **02 Trace** | A bright arc travels around the perimeter | thickness, arc length, edge fade, lap time, inset, intensity, tint, direction |

Each layer has its own on/off switch, so you can solo either one. Corner radius
is shared. **Copy CSS** puts the current values on the clipboard as a
ready-to-paste `.demo-button { … }` block; **Reset defaults** restores them.

Also along the top: light/dark theme, four button families (primary, secondary,
two accents), and an editable button label.

## How it works

Defaults live in CSS as custom properties on `.demo-button` (`styles.css`).
JavaScript only ever writes *inline overrides* of those properties, so the
stylesheet stays the single source of truth and "reset" is just dropping the
overrides.

Adding a new knob is one row in the `RANGES` table in `script.js` plus a markup
block in `index.html` — the wiring is data-driven.

Three structural details worth knowing before editing:

- The shine lives in its own `<span class="shine">` clipping layer. The button
  itself has no `overflow:hidden`, which is what lets the trace extend outside
  the border box and makes the *Inset* control meaningful.
- The shine is a CSS `animation`, not a transition, so it can be replayed.
  Clicking the button drops the animation for one frame and lets the hover rule
  reapply it from the top.
- The sweeping box is always exactly one button wide; the band is painted
  *inside* it as gradient stops. That is deliberate — `translateX` resolves
  percentages against the element's own width, so sizing the box to the band
  would make *travel* a percentage of *band width*, and widening the band would
  silently lengthen the sweep. As written, band width, start offset and travel
  are all percentages of the button, and all three are independent.

## Notes

- *Arc length* + *edge fade* above 360° collapses the trace into a solid ring.
  It degrades gracefully rather than erroring, but it's a soft ceiling.
- The page respects `prefers-reduced-motion`: the shine collapses to its end
  frame and the trace parks as a static arc. Note the trace has to be switched
  off by name rather than by duration — it loops forever, so a near-zero
  duration would leave it repainting every frame. If the animations look dead,
  check that OS setting first.
- Light/dark is driven entirely by the toggle. `color-scheme` is pinned to the
  chosen theme so the native controls and scrollbar follow it rather than the
  OS preference.
- The trace uses `@property`, `conic-gradient` and `mask-composite`; the tints
  use `color-mix()`; theming and the disabled-swatch styling use `:has()`. All
  are modern-browser features.
