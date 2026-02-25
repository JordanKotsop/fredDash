import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  explanation?: string;
  conversationExcerpts?: { role: 'user' | 'assistant'; content: string }[];
  seriesLabels?: string[];
  dateRange?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function formatDate(): string {
  return new Date().toISOString().split('T')[0];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function exportChartToPdf(
  chartElement: HTMLElement,
  options: PdfExportOptions
): Promise<void> {
  const {
    title,
    subtitle,
    explanation,
    conversationExcerpts,
    seriesLabels,
    dateRange,
  } = options;

  // Capture chart as PNG using html-to-image (foreignObject approach).
  // Unlike html2canvas, this lets the browser handle all CSS rendering
  // natively — no issues with modern color functions like lab()/oklch().
  const imgData = await toPng(chartElement, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    filter: (node: HTMLElement) => {
      return !node.classList?.contains('sr-only');
    },
  });

  const img = await loadImage(imgData);

  // Create PDF (landscape A4)
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  // --- Header ---
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageW, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FredDash Report', margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatDate()}`, pageW - margin, 12, { align: 'right' });

  y = 26;

  // --- Title ---
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  y += 7;

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, margin, y);
    y += 5;
  }

  if (seriesLabels?.length) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Series: ${seriesLabels.join(', ')}`, margin, y);
    y += 4;
  }

  if (dateRange) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Date Range: ${dateRange}`, margin, y);
    y += 4;
  }

  y += 2;

  // --- Chart Image ---
  const imgAspect = img.width / img.height;
  const imgW = Math.min(contentW, 250);
  const imgH = imgW / imgAspect;

  if (y + imgH > pageH - 25) {
    doc.addPage();
    y = margin;
  }

  doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
  y += imgH + 6;

  // --- Explanation ---
  if (explanation) {
    if (y + 20 > pageH - 25) {
      doc.addPage();
      y = margin;
    }

    // Measure text first to get box height
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const explanationLines = doc.splitTextToSize(explanation, contentW - 8);
    const textBlockH = explanationLines.length * 4.5;
    const boxPaddingTop = 10; // space for "What This Means" heading
    const boxPaddingBottom = 6;
    const boxH = boxPaddingTop + textBlockH + boxPaddingBottom;

    // Draw background FIRST
    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'F');

    // Then draw heading
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('What This Means', margin + 4, y + 6);

    // Then draw explanation text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 64, 175);
    doc.text(explanationLines, margin + 4, y + boxPaddingTop + 2);

    y += boxH + 4;
  }

  // --- Full Conversation ---
  if (conversationExcerpts?.length) {
    const footerReserve = 20; // space reserved for footer
    const lineH = 3.8; // line height at font size 8

    if (y + 15 > pageH - footerReserve) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Conversation', margin, y);
    y += 7;

    for (const msg of conversationExcerpts) {
      const prefix = msg.role === 'user' ? 'You: ' : 'AI: ';

      doc.setFontSize(8);
      doc.setFont('helvetica', msg.role === 'user' ? 'bold' : 'normal');
      doc.setTextColor(
        msg.role === 'user' ? 37 : 75,
        msg.role === 'user' ? 99 : 85,
        msg.role === 'user' ? 235 : 99
      );

      const lines: string[] = doc.splitTextToSize(`${prefix}${msg.content}`, contentW - 4);

      // Render lines one-by-one, adding pages as needed
      for (const line of lines) {
        if (y + lineH > pageH - footerReserve) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin + 2, y);
        y += lineH;
      }

      y += 3; // gap between messages
    }
  }

  // --- Footer (on every page) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageH - 10;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY - 3, pageW - margin, footerY - 3);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text('Data Source: Federal Reserve Economic Data (FRED), Federal Reserve Bank of St. Louis', margin, footerY);
    doc.text('This report is for informational purposes only and does not constitute financial advice.', margin, footerY + 3.5);
    doc.text('FredDash — AI-Powered Economic Data Dashboard', pageW - margin, footerY, { align: 'right' });
  }

  // --- Save ---
  const filename = `fredDash-${slugify(title)}-${formatDate()}.pdf`;
  doc.save(filename);
}
