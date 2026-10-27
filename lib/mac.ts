const hexPattern = /[0-9A-F]/;

export function maskMac(value: string) {
  const hex = value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 12);
  return hex.match(/.{1,2}/g)?.join(":") ?? "";
}

export function maskMacOrOtp(value: string) {
  const compact = value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 12);
  if (/^\d{0,6}$/.test(compact)) return compact;
  return maskMac(compact);
}

function caretFromHexCount(formatted: string, hexCount: number) {
  if (hexCount <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (hexPattern.test(formatted[index] ?? "")) seen += 1;
    if (seen === hexCount) return index + 1;
  }
  return formatted.length;
}

export function applyMacChange(previous: string, raw: string, selectionStart: number, allowOtp = false) {
  let source = raw;
  let hexBefore = source.slice(0, selectionStart).replace(/[^0-9A-Fa-f]/g, "").length;
  if (raw.length < previous.length && selectionStart < previous.length && previous[selectionStart] === ":") {
    const hex = source.replace(/[^0-9A-Fa-f]/g, "");
    const cut = Math.max(0, hexBefore - 1);
    source = hex.slice(0, cut) + hex.slice(hexBefore);
    hexBefore = cut;
  }
  const formatted = allowOtp ? maskMacOrOtp(source) : maskMac(source);
  const caretHex = Math.min(hexBefore, formatted.replace(/[^0-9A-F]/g, "").length);
  return { value: formatted, caret: caretFromHexCount(formatted, caretHex) };
}
