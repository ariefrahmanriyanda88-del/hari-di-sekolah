set -e
cd /home/claude/game && bash build3.sh >/dev/null
cd online
npx esbuild src/guru-app.js --bundle --minify --format=iife --loader:.json=json --outfile=dist/guru.js --log-level=warning
npx esbuild src/online-game.js --bundle --minify --format=iife --outfile=dist/online.js --log-level=warning
cp src/guru.html dist/guru.html; [ -f dist/config.js ] || cp src/config.js dist/config.js
cp ../azan.mp3 dist/azan.mp3; cp firestore.rules dist/firestore.rules
# game: sisipkan config.js + online.js sebelum skrip game
python3 - <<'PY'
s=open('/home/claude/game/hari3.html').read()
i=s.rfind('<script>')
s=s[:i]+'<script src="config.js"></script>\n<script src="online.js"></script>\n'+s[i:]
open('dist/main.html','w').write(s)
PY
cp src/landing.html dist/index.html; mkdir -p dist/templat; cp src/templat/* dist/templat/; mkdir -p dist/img; cp src/img/*.webp dist/img/; ls dist
