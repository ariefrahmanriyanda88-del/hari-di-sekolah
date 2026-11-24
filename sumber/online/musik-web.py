# Musik latar website: loop ceria & lembut (orisinal), ~64 detik, D mayor/pentatonik.
import numpy as np, scipy.io.wavfile as wf
SR = 44100; BPM = 90; beat = 60 / BPM; bars = 24; L = int(SR * beat * 4 * bars)
out = np.zeros(L)
def note(f, t, d, vol, kind='pluck'):
    n = int(d * SR); s = int(t * SR)
    if s >= L: return
    n = min(n, L - s); tt = np.arange(n) / SR
    if kind == 'pluck':   # gitar/marimba lembut
        w = (np.sin(2*np.pi*f*tt) + 0.35*np.sin(4*np.pi*f*tt) + 0.12*np.sin(6*np.pi*f*tt)) * np.exp(-tt*3.2)
        w *= np.minimum(1, tt/0.005)
    elif kind == 'pad':   # bantalan akor
        w = (np.sin(2*np.pi*f*tt) + 0.5*np.sin(2*np.pi*f*1.003*tt) + 0.25*np.sin(4*np.pi*f*tt))
        a = np.minimum(1, tt/0.6) * np.minimum(1, (d - tt)/0.8); w *= a
    elif kind == 'bass':
        w = np.sin(2*np.pi*f*tt) * np.exp(-tt*2.0) * np.minimum(1, tt/0.01)
    elif kind == 'flute':
        vib = 1 + 0.004*np.sin(2*np.pi*5.2*tt)
        w = (np.sin(2*np.pi*f*vib*tt) + 0.2*np.sin(4*np.pi*f*vib*tt)) * np.minimum(1, tt/0.06) * np.minimum(1, (d-tt)/0.15)
    out[s:s+n] += w * vol
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def drum(t, kind):
    s = int(t*SR); n = int(0.25*SR)
    if s+n > L: return
    tt = np.arange(n)/SR
    if kind == 'dum':   # rebana bas
        w = np.sin(2*np.pi*(90*np.exp(-tt*8)+55)*tt) * np.exp(-tt*9)
        out[s:s+n] += w*0.42
    else:               # tak (rebana tinggi)
        w = np.random.randn(n) * np.exp(-tt*38) * 0.16
        w += np.sin(2*np.pi*420*tt)*np.exp(-tt*30)*0.1
        out[s:s+n] += w
# progresi: D – Bm – G – A (I–vi–IV–V)
prog = [(62, [62, 66, 69]), (59, [59, 62, 66]), (55, [55, 59, 62]), (57, [57, 61, 64])]
mel_a = [74, 76, 78, 81, 78, 76, 74, None, 71, 74, 76, 78, 76, 74, 71, None]
mel_b = [78, 81, 83, 81, 78, 76, 78, None, 76, 74, 71, 74, 76, 78, 74, None]
np.random.seed(7)
for b in range(bars):
    t0 = b * 4 * beat; root, ch = prog[b % 4]
    for f in ch: note(hz(f), t0, 4*beat, 0.045, 'pad')
    note(hz(root-12), t0, 1.6, 0.25, 'bass'); note(hz(root-12), t0+2*beat, 1.6, 0.2, 'bass')
    arp = ch + [ch[1]+12, ch[2], ch[1], ch[0]+12, ch[2]]
    for i in range(8): note(hz(arp[i % len(arp)] + 12), t0 + i*beat/2, 0.9, 0.07, 'pluck')
    if b >= 2:
        for i, k in enumerate(['dum', 'tak', 'tak', 'dum', 'tak', 'dum', 'tak', 'tak']):
            if b % 8 == 7 and i > 5: continue
            drum(t0 + i*beat/2, k)
    if 4 <= b < 20:
        mel = mel_a if (b // 4) % 2 == 0 else mel_b
        half = (b % 2) * 8
        for i in range(8):
            m = mel[half + i]
            if m: note(hz(m), t0 + i*beat/2, beat*0.5 if mel[(half+i+1) % 16] else beat, 0.09, 'flute')
# gema sederhana
d = int(0.33*SR); echo = np.zeros_like(out); echo[d:] = out[:-d]*0.28; out += echo
# fade halus di awal & akhir agar loop mulus
f = int(1.2*SR); out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
out /= np.max(np.abs(out)) * 1.15
wf.write('/home/claude/t/musik.wav', SR, (out*32767).astype(np.int16))
print(L/SR)
