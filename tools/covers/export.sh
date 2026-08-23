#!/bin/sh
# Renders each cover card to /img/covers/ as <name>@2x.png + <name>.png.
#
# Geometry: each card page sets .cover { width: 1200px } (content-box),
# so 1cqw resolves to 12px and the 8cqw padding adds 96px per side.
# The card's outer box is therefore exactly 1392x1392 — the render
# window matches it, so the screenshot IS the card, no cropping.
# The 1x is a clean 2:1 downscale (696px), well above the ~555px the
# work grid ever displays at 1x.
#
# Requires Google Chrome and network access (Google Fonts).

set -e
cd "$(dirname "$0")"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="../../img/covers"
mkdir -p "$OUT"

for name in naturedose pecan visualization_community naturequant canon; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1392,1392 \
    --screenshot="$OUT/$name@2x.png" --virtual-time-budget=4000 \
    "file://$PWD/$name.html" 2>/dev/null
  sips -z 696 696 "$OUT/$name@2x.png" --out "$OUT/$name.png" >/dev/null
  echo "exported $name  ($(stat -f%z "$OUT/$name@2x.png")b @2x, $(stat -f%z "$OUT/$name.png")b 1x)"
done
