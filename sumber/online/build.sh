set -e
cd /home/claude/game && bash build3.sh >/dev/null
cd online
npx esbuild src/guru-app.js --bundle --minify --format=iife --loader:.json=json --outfile=dist/guru.js --log-level=warning
npx esbuild src/online-game.js --bundle --minify --format=iife --outfile=dist/online.js --log-level=warning
[ -f dist/config.js ] || cp src/config.js dist/config.js
cp ../azan.mp3 dist/azan.mp3; cp ../himne-guru.mp3 dist/himne-guru.mp3; cp firestore.rules dist/firestore.rules
# game: sisipkan config.js + online.js sebelum skrip game
python3 - <<'PY'
s=open('/home/claude/game/hari3.html').read()
i=s.rfind('<script>')
import time, json, re
V=str(int(time.time()))
# pemeriksa versi: bila ada versi baru di server, halaman memuat ulang sendiri (mengatasi cache browser)
CHK='<script>(function(){var V="'+V+'";try{var u=new URL(location.href);if(u.searchParams.get("v")===V)return;fetch("version.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.json()}).then(function(j){if(j.v&&j.v!==V){u.searchParams.set("v",j.v);location.replace(u.toString())}}).catch(function(){})}catch(e){}})();</script>'
s=s[:i]+'<script src="config.js?v='+V+'"></script>\n<script src="online.js?v='+V+'"></script>\n'+s[i:]
s=s.replace('<head>','<head>\n'+CHK,1)
open('dist/main.html','w').write(s)
g=open('src/guru.html').read()
g=g.replace('<head>','<head>\n'+CHK,1)
g=re.sub(r'src="(guru\.js|config\.js)"', lambda m: 'src="'+m.group(1)+'?v='+V+'"', g)
open('dist/guru.html','w').write(g)
json.dump({'v':V}, open('dist/version.json','w'))
PY
cp src/landing.html dist/index.html; cp src/musik-web.mp3 dist/musik-web.mp3; mkdir -p dist/templat; cp src/templat/* dist/templat/; mkdir -p dist/img; cp src/img/*.webp dist/img/; ls dist
