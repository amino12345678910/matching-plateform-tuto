export function generateRandNum(opts: {lowercase?: boolean; maxLen?: number} = {}): string {
  const {lowercase = true, maxLen = 10} = opts;

  let s = Math.floor(Math.random() * 100)
    .toString()
    .padStart(maxLen, '0');

  if (s.length > maxLen) {
    const cut = s.slice(0, maxLen);
    const lastHyphen = cut.lastIndexOf('-');
    s = lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut.slice(0, maxLen);
    s = s.replace(/-+$/g, '');
  }

  if (lowercase) s = s.toLowerCase();

  return s;
}
