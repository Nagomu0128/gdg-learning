// git-sim の決定的ハッシュ(FNV-1a 32bit → 7桁hex)。
// Date.now / Math.random は使わない(同一入力 → 同一ハッシュの決定性が判定の前提)。

export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // FNV prime 16777619 の乗算(32bit オーバーフロー安全な shift 分解)
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

/** コミットハッシュ風の 7 桁 hex 文字列 */
export function shortHash(input: string): string {
  return fnv1a(input).toString(16).padStart(8, "0").slice(0, 7);
}
