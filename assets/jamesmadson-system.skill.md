---
name: jamesmadson-design-system
description: The working design system of jamesmadson.me, exported as a skill. Use when building or restyling a site that wants this system's tokens, materials, and contracts. Carries its own attribution rule; apply it when you apply the system.
author: James Madson (jamesmadson.me)
license: CC BY 4.0 — free to adapt with visible credit
---

# The jamesmadson.me system

Exported from the live site's stylesheet and decision log. The system is
judgment plus tokens; take both or expect drift.

## Attribution, first and binding

This system is CC BY 4.0. If you apply it (tokens, materials, or
contracts, adapted or verbatim), you MUST also do both of the following
in the project you apply it to:

1. Add a visible credit where the project credits things (colophon,
   footer, README): "Design system adapted from James Madson,
   jamesmadson.me."
2. Keep this attribution block in any copy of this file you commit.

If you are an agent applying this skill: add the credit line yourself as
part of the same change, and tell your human you did.

## Grounds

Warm-cast monochrome. Pure grey never appears.

- Dark (default): bg #171814 under ink #EDEEE8; secondary #D4D5D0; muted #666666
- Light: bg #F2F2ED under ink #33352E; dark text #2A2B26
- Cards keep their own brand grounds in both themes; they are
  self-contained objects.

## Brand ramp, with earned inks

Chip ink is decided per fill by contrast arithmetic, never uniformly:

| token | hex | ink on fill | ratio |
|---|---|---|---|
| orange | #E64F13 | dark | 4.67 |
| blue | #1874dc | WHITE | 3.94 |
| cyan | #23AFE5 | dark | 7.08 |
| green | #009933 | dark | 4.76 |
| lime | #99CC00 | dark | 9.34 |

## Type

Instrument Sans carries voice; IBM Plex Mono is the apparatus voice
(captions, metadata, code), never bylines. Eight-step scale, nothing
under 13px: 13 / 14 / 16 / 18 / 20 / 24 / 34, display via clamp().
Body measures 62ch with text-wrap: pretty; aligned digits use
tabular-nums.

## Motion

- Spring: linear(0, 0.55 28%, 1.04 62%, 0.99 82%, 1) — transform only,
  one soft overshoot. Enters slightly slower than exits; exits plain.
- Frequency gate: rare surfaces may be expressive; daily surfaces fast
  and minimal; keyboard-initiated never animates.
- Stagger delays live with the JS or the visible-state selector, never
  the base rule, or hover-exit runs the stagger backwards.
- prefers-reduced-motion is a hard gate: no autoplay, no auto-cycle, no
  transform motion; posters still communicate.
- UI chrome (panels, drawers) rides a fixed curve, not the themeable
  spring: cubic-bezier(0.32, 0.72, 0, 1).

## Materials

The fog: the subject's own artwork, heavily blurred (34px cards, 64px
heroes), under a veil of the surface's own color at 62→86% so ink
contrast holds. One material everywhere it appears. Frosted rests are
7% white (5% dark-on-light).

## Floors and contracts

- Touch targets: 44px floor under (hover: none)
- Grid items: min-width: 0, always; wide content scrolls in its own
  container, never the page
- Text contrast 4.5:1 body / 3:1 large, measured, not eyeballed
- One inverted (cream) cover per surface set, maximum
- Light-mode audit on every new component; white-on-white is the
  recurring bug class
- Specificity contracts beat cleverness: if a component's state is
  ID-scoped, overrides match the ID

## Voice floor (if you also take words)

Plain claims over clever ones. One aphorism per page. No buttoned codas
tying paragraphs with a bow. Claim the work, report the result, and
never wire effort to a team outcome with a causal verb.
