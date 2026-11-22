// Lapisan data: Firebase (asli) atau Mock (demo, tersimpan di perangkat ini saja)
import { initializeApp } from 'firebase/app';
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  sendEmailVerification, sendPasswordResetEmail, signInAnonymously,
} from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp,
} from 'firebase/firestore';

const norm = (o) => { for (const k in o) if (o[k] && typeof o[k].toMillis === 'function') o[k] = o[k].toMillis(); return o; };
const wrapUser = (u) => u && { uid: u.uid, email: u.email, emailVerified: u.emailVerified, anon: u.isAnonymous };

function makeFirebase(cfg) {
  const app = initializeApp(cfg);
  const auth = getAuth(app); auth.languageCode = 'id';
  const db = getFirestore(app);
  return {
    demo: false,
    onUser: (cb) => onAuthStateChanged(auth, (u) => cb(wrapUser(u))),
    user: () => wrapUser(auth.currentUser),
    daftar: async (e, p) => { const c = await createUserWithEmailAndPassword(auth, e, p); await sendEmailVerification(c.user); return wrapUser(c.user); },
    login: (e, p) => signInWithEmailAndPassword(auth, e, p),
    logout: () => signOut(auth),
    verifikasi: () => sendEmailVerification(auth.currentUser),
    reset: (e) => sendPasswordResetEmail(auth, e),
    reload: async () => { await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); return wrapUser(auth.currentUser); },
    anon: async () => (auth.currentUser || (await signInAnonymously(auth)).user).uid,
    get: async (c, id) => { const s = await getDoc(doc(db, c, id)); return s.exists() ? norm({ id: s.id, ...s.data() }) : null; },
    set: (c, id, d) => setDoc(doc(db, c, id), d),
    add: (c, d) => addDoc(collection(db, c), d).then((r) => r.id),
    upd: (c, id, d) => updateDoc(doc(db, c, id), d),
    del: (c, id) => deleteDoc(doc(db, c, id)),
    q: async (c, conds = []) => {
      const s = await getDocs(query(collection(db, c), ...conds.map(([f, o, v]) => where(f, o, v))));
      return s.docs.map((d) => norm({ id: d.id, ...d.data() }));
    },
    now: () => serverTimestamp(),
  };
}

// ---------- Mock: meniru Firebase di localStorage, untuk demo & uji coba ----------
function makeMock(adminEmail) {
  const KEY = 'hds-demo-db';
  let db; try { db = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { db = null; }
  if (!db) db = { users: {}, cur: null, data: { guru: {}, soal: {}, nilai: {}, kodekelas: {} } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* abaikan */ } };
  const listeners = [];
  const uid = () => Math.random().toString(36).slice(2, 12);
  const me = () => db.cur && db.users[db.cur] ? { uid: db.cur, email: db.users[db.cur].email, emailVerified: true, anon: db.users[db.cur].anon } : null;
  const emit = () => { save(); listeners.forEach((f) => f(me())); };
  const err = (code) => { const e = new Error(code); e.code = code; throw e; };
  const col = (c) => (db.data[c] = db.data[c] || {});
  const match = (d, [f, o, v]) => (o === '==' ? d[f] === v : o === 'in' ? v.includes(d[f]) : o === 'array-contains' ? (d[f] || []).includes(v) : o === 'array-contains-any' ? v.some((x) => (d[f] || []).includes(x)) : true);
  const api = {
    demo: true,
    onUser: (cb) => { listeners.push(cb); setTimeout(() => cb(me()), 0); return () => {}; },
    user: me,
    daftar: async (e, p) => {
      if (Object.values(db.users).some((u) => u.email === e)) err('auth/email-already-in-use');
      if ((p || '').length < 6) err('auth/weak-password');
      const id = uid(); db.users[id] = { email: e, pass: p }; db.cur = id; emit(); return me();
    },
    login: async (e, p) => { const id = Object.keys(db.users).find((k) => db.users[k].email === e && db.users[k].pass === p); if (!id) err('auth/invalid-credential'); db.cur = id; emit(); },
    logout: async () => { db.cur = null; emit(); },
    verifikasi: async () => {}, reset: async () => {}, reload: async () => me(),
    anon: async () => { if (!db.cur) { const id = uid(); db.users[id] = { anon: true }; db.cur = id; save(); } return db.cur; },
    get: async (c, id) => (col(c)[id] ? { id, ...col(c)[id] } : null),
    set: async (c, id, d) => { col(c)[id] = JSON.parse(JSON.stringify(d)); save(); },
    add: async (c, d) => { const id = uid(); col(c)[id] = JSON.parse(JSON.stringify(d)); save(); return id; },
    upd: async (c, id, d) => { if (!col(c)[id]) err('not-found'); Object.assign(col(c)[id], JSON.parse(JSON.stringify(d))); save(); },
    del: async (c, id) => { delete col(c)[id]; save(); },
    q: async (c, conds = []) => Object.entries(col(c)).map(([id, d]) => ({ id, ...d })).filter((d) => conds.every((x) => match(d, x))),
    now: () => Date.now(),
    _admin: adminEmail,
  };
  return api;
}

export function makeBackend() {
  const C = window.HDS_CONFIG || {};
  const real = C.firebase && C.firebase.apiKey && !/ISI_|xxx/i.test(C.firebase.apiKey);
  return real ? makeFirebase(C.firebase) : makeMock(C.admin);
}

export const pesanError = (e) => {
  const c = (e && (e.code || e.message)) || '';
  const M = {
    'auth/invalid-credential': 'Email atau kata sandi salah.',
    'auth/wrong-password': 'Email atau kata sandi salah.',
    'auth/user-not-found': 'Email belum terdaftar.',
    'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan masuk.',
    'auth/weak-password': 'Kata sandi minimal 6 karakter.',
    'auth/invalid-email': 'Format email tidak benar.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu beberapa menit.',
    'auth/network-request-failed': 'Tidak ada koneksi internet.',
    'auth/admin-restricted-operation': 'Login murid (Anonymous) belum diaktifkan di Firebase.',
    'auth/operation-not-allowed': 'Metode login ini belum diaktifkan di Firebase.',
    'permission-denied': 'Akses ditolak. Akun belum disetujui admin atau tidak berhak.',
    unavailable: 'Server tidak bisa dihubungi. Periksa internet.',
  };
  for (const k in M) if (c.includes(k)) return M[k];
  return 'Terjadi kesalahan: ' + c;
};
