/**
 * Sanitizes rich-text HTML descriptions from TipTap/Quill editors to prevent Stored XSS.
 * Removes dangerous tags (<script>, <iframe>, <object>, <embed>, <style>, <link>, <meta>, <form>),
 * strips all inline event handlers (onerror=, onload=, onclick=, etc.),
 * and neutralizes javascript: / vbscript: / data:text/html URIs.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeRichHtml(input: string): string {
  if (!input) return '';

  let clean = input;

  // 1. Remove dangerous block tags and their contents
  clean = clean.replace(
    /<\s*(script|iframe|object|embed|style|applet|form|meta|link|base|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ''
  );

  // 2. Remove self-closing or unclosed dangerous tags
  clean = clean.replace(
    /<\s*\/?\s*(script|iframe|object|embed|style|applet|form|meta|link|base|input|button|textarea|select)\b[^>]*\/?>/gi,
    ''
  );

  // 3. Remove any inline event handler attributes (on*=...)
  clean = clean.replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 4. Neutralize javascript:, vbscript:, and data: protocols inside href/src/xlink:href/action
  clean = clean.replace(
    /(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data):[^"]*"|'\s*(?:javascript|vbscript|data):[^']*'|(?:\s*(?:javascript|vbscript|data):[^\s>]+))/gi,
    '$1="#"'
  );

  return clean;
}
