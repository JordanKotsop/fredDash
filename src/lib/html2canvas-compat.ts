/**
 * Sanitise a cloned document so html2canvas can parse all CSS colour values.
 *
 * Tailwind CSS v4 outputs lab()/oklch() colour functions that html2canvas
 * cannot handle.  Modern browsers also return these functions from
 * getComputedStyle(), which is what html2canvas reads per-element.
 *
 * This function:
 *  1. Regex-replaces modern colour functions in all <style> tag text
 *  2. Walks every element and converts unsupported computed colours to hex
 *     via the Canvas 2D API (which always resolves to sRGB)
 *  3. Forces light-mode CSS variables
 */
export function sanitiseColorsForCapture(clonedDoc: Document): void {
  const MODERN_COLOR_FN = /(?:oklch|oklab|lab|lch)\([^)]+\)/gi;

  // ---- 1. Sanitise <style> tag text ----
  for (const style of clonedDoc.querySelectorAll('style')) {
    const text = style.textContent;
    if (text && MODERN_COLOR_FN.test(text)) {
      MODERN_COLOR_FN.lastIndex = 0;
      style.textContent = text.replace(MODERN_COLOR_FN, '#888');
    }
  }

  // ---- 2. Override computed colour properties on every element ----
  // html2canvas calls getComputedStyle(el) for each element and tries to
  // parse each colour value.  Modern Chrome/Safari preserve lab()/oklch()
  // in computed styles, so html2canvas chokes.  We detect these and
  // convert them to hex via the Canvas 2D fillStyle setter, which always
  // resolves to an sRGB hex string.
  const view = clonedDoc.defaultView;
  if (!view) return;

  const cvs = document.createElement('canvas');
  cvs.width = 1;
  cvs.height = 1;
  const ctx = cvs.getContext('2d');
  if (!ctx) return;

  const UNSAFE_RE = /(?:oklch|oklab|lab|lch)\(/i;
  const COLOR_PROPS = [
    'color',
    'background-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'fill',
    'stroke',
  ];

  for (const el of clonedDoc.querySelectorAll('*')) {
    const htmlEl = el as HTMLElement;
    if (!htmlEl.style) continue;

    const computed = view.getComputedStyle(el);
    for (const prop of COLOR_PROPS) {
      const val = computed.getPropertyValue(prop);
      if (val && UNSAFE_RE.test(val)) {
        // Canvas 2D resolves any CSS color to hex (#rrggbb)
        ctx.fillStyle = '#000000';
        ctx.fillStyle = val;
        htmlEl.style.setProperty(prop, ctx.fillStyle);
      }
    }
  }

  // ---- 3. Force light-mode variables ----
  const root = clonedDoc.documentElement;
  root.style.setProperty('--background', '#ffffff');
  root.style.setProperty('--foreground', '#171717');
  root.style.setProperty('color-scheme', 'light');
  clonedDoc.body.style.backgroundColor = '#ffffff';
  clonedDoc.body.style.color = '#171717';
}
