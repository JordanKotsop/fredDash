import html2canvas from 'html2canvas';

const TWITTER_WIDTH = 1200;
const TWITTER_HEIGHT = 675;

export async function captureChartImage(
  chartElement: HTMLElement
): Promise<string> {
  // Capture at 2x for sharpness
  const canvas = await html2canvas(chartElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  // Create a new canvas at Twitter card dimensions
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = TWITTER_WIDTH * 2;
  outputCanvas.height = TWITTER_HEIGHT * 2;
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

  // Scale and center the chart within the card
  const sourceAspect = canvas.width / canvas.height;
  const targetAspect = outputCanvas.width / outputCanvas.height;

  let drawW: number, drawH: number, drawX: number, drawY: number;
  const padding = 40; // px padding at 2x

  if (sourceAspect > targetAspect) {
    // Source is wider — fit to width
    drawW = outputCanvas.width - padding * 2;
    drawH = drawW / sourceAspect;
    drawX = padding;
    drawY = (outputCanvas.height - drawH) / 2;
  } else {
    // Source is taller — fit to height
    drawH = outputCanvas.height - padding * 2;
    drawW = drawH * sourceAspect;
    drawX = (outputCanvas.width - drawW) / 2;
    drawY = padding;
  }

  ctx.drawImage(canvas, drawX, drawY, drawW, drawH);

  // Watermark
  ctx.save();
  ctx.font = '600 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(156, 163, 175, 0.5)';
  ctx.textAlign = 'right';
  ctx.fillText('FredDash', outputCanvas.width - 30, outputCanvas.height - 24);
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText('Data: FRED, Federal Reserve Bank of St. Louis', outputCanvas.width - 30, outputCanvas.height - 6);
  ctx.restore();

  return outputCanvas.toDataURL('image/png');
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
