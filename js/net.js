// =========================================================
//  ネットワーク層（マルチプレイ用）
//  ---------------------------------------------------------
//  いまは「コードを コピーして おくりあう」方式（サーバー不要・アカウント不要）。
//  オンライン化するときは 同じメソッドをもつ OnlineAdapter を作り、
//  いちばん下の `export const net = ...` を さしかえるだけで UI は そのまま動きます。
//
//  interface NetAdapter {
//    shareProfile(card)   -> Promise<string>   じぶんのカードを公開し、ともだちに渡す文字列を返す
//    lookupFriend(input)  -> Promise<card>     コード(またはID)から ともだちのカードを取得
//    sendGift(gift)       -> Promise<string>   プレゼントを送る（ローカルではコードを返す）
//    receiveGift(input)   -> Promise<gift>     プレゼントを受けとる
//  }
// =========================================================
import { hashStr } from './state.js';

const toB64 = obj => {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64 = str => {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
};
const check = s => (hashStr(s) % 46656).toString(36).padStart(3, '0');

export function pack(prefix, obj) { const body = toB64(obj); return `${prefix}.${body}.${check(prefix + body)}`; }
export function unpack(prefix, code) {
  const parts = String(code || '').replace(/\s+/g, '').split('.');
  if (parts.length !== 3 || parts[0] !== prefix) throw new Error('コードの かたちが ちがうみたい');
  if (check(prefix + parts[1]) !== parts[2]) throw new Error('コードが とちゅうで きれてるかも');
  try { return fromB64(parts[1]); } catch (e) { throw new Error('コードが よめなかった'); }
}

// ---- リンク方式（タップするだけで ともだち／プレゼント／ひっこし）----
//   #f=... ともだちカード   #g=... プレゼント   #m=... ひっこし（セーブデータ）
export const linkBase = () => location.origin + location.pathname;
export function makeLink(kind, obj) { const body = toB64(obj); return `${linkBase()}#${kind}=${body}.${check(kind + body)}`; }
export function parseLink(text) {
  const m = String(text || '').replace(/\s+/g, '').match(/#([fgm])=([A-Za-z0-9_-]+)\.([0-9a-z]{3})/);
  if (!m) return null;
  if (check(m[1] + m[2]) !== m[3]) throw new Error('リンクが とちゅうで きれてるかも');
  try { return { kind: m[1], data: fromB64(m[2]) }; } catch (e) { throw new Error('リンクが よめなかった'); }
}

export class LocalCodeAdapter {
  name = 'local';
  label = 'コードこうかん';
  async shareProfile(card) { return pack('IKA1', card); }
  async lookupFriend(input) {
    const l = parseLink(input);
    if (l && l.kind !== 'f') throw new Error('それは ともだちリンクじゃ ないみたい');
    const c = l ? l.data : unpack('IKA1', input);
    if (!c.pid || !c.name) throw new Error('カードの なかみが たりない');
    return c;
  }
  async sendGift(gift) { return pack('GIFT1', gift); }
  async receiveGift(input) {
    const l = parseLink(input);
    if (l && l.kind !== 'g') throw new Error('それは プレゼントリンクじゃ ないみたい');
    const g = l ? l.data : unpack('GIFT1', input);
    if (!g.gid || !g.kind || !g.id) throw new Error('プレゼントの なかみが たりない');
    return g;
  }
}

// 例）オンライン版のひな形（Supabase / Firebase など、ログイン不要の匿名認証で実装予定）
// export class OnlineAdapter {
//   name = 'online'; label = 'オンライン';
//   constructor(client) { this.db = client; }
//   async shareProfile(card) { await this.db.upsert('cards', card); return card.pid; }   // IDだけ教えればOK
//   async lookupFriend(pid)  { return await this.db.get('cards', pid); }
//   async sendGift(gift)     { await this.db.insert('gifts', gift); return 'sent'; }
//   async receiveGift()      { return await this.db.popInbox(); }
// }

export const net = new LocalCodeAdapter();
