#!/usr/bin/env bash
# Package a built kit into examples/<name>/ with lightweight previews (no fonts or captured raw assets).
set -euo pipefail
src="$1"; name="$2"; dest="examples/$name"
rm -rf "$dest"; mkdir -p "$dest/previews"
cp "$src/WATERCOLOR.md" "$src/strategy.json" "$dest/"
# captured/ isn't shipped with examples — drop embedded screenshots that would 404.
perl -0pi -e 's/ ?· !\[\]\(captured\/[^)]*\)//g; s/!\[\]\(captured\/[^)]*\)\n?//g' "$dest/WATERCOLOR.md"
jpg() { [ -f "$src/$1" ] && ffmpeg -loglevel error -y -i "$src/$1" -vf "scale='min($3,iw)':-2" -q:v 4 "$dest/previews/$2.jpg" || true; }
jpg social/og-default.png og-default 1200
jpg social/instagram-post.png instagram-post 720
jpg social/x-header.png x-header 1200
jpg colors/palette.png palette 1200
jpg typography/specimen.png specimen 1200
jpg patterns/watercolor-wash.png watercolor-wash 1200
jpg patterns/mesh-gradient.png mesh-gradient 1200
jpg logo/lockups/logo-on-dark.png logo-on-dark 800
jpg templates/slides-preview.png slides 1200
jpg motion/logo-reveal-poster.png logo-reveal 960
[ -f "$src/motion/gradient-loop.gif" ] && ffmpeg -loglevel error -y -i "$src/motion/gradient-loop.gif" -t 3 -vf "fps=10,scale=320:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=48[p];[b][p]paletteuse=dither=bayer:bayer_scale=5" "$dest/previews/gradient-loop.gif" || true
[ -f "$src/motion/logo-reveal.gif" ] && ffmpeg -loglevel error -y -i "$src/motion/logo-reveal.gif" -vf "fps=15,scale=400:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=32[p];[b][p]paletteuse" "$dest/previews/logo-reveal.gif" || true
du -sh "$dest"
