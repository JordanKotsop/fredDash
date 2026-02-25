import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  // Capture chart at 2x resolution.
  // html2canvas cannot parse CSS lab() colors (used by Tailwind v4),
  // so we temporarily override computed styles on the element to avoid crashes.
  // Setting ignoreElements to skip elements outside the chart also helps.
  const canvas = await html2canvas(chartElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    // Ignore elements that might use unsupported CSS color functions
    ignoreElements: (el) => {
      return el.tagName === 'STYLE' || el.classList?.contains('sr-only');
    },
    onclone: (clonedDoc) => {
      // Force all elements in the clone to use simple rgb colors
      // This prevents html2canvas from choking on lab(), oklch(), etc.
      const root = clonedDoc.documentElement;
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#171717');
      root.style.setProperty('color-scheme', 'light');

      // Force light mode on the cloned body
      const body = clonedDoc.body;
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#171717';
    },
  });

  const imgData = canvas.toDataURL('image/png');

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
  const imgAspect = canvas.width / canvas.height;
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

  // --- Conversation Excerpts ---
  if (conversationExcerpts?.length) {
    if (y + 15 > pageH - 25) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Conversation Highlights', margin, y);
    y += 6;

    for (const msg of conversationExcerpts.slice(0, 6)) {
      if (y + 12 > pageH - 25) {
        doc.addPage();
        y = margin;
      }

      const prefix = msg.role === 'user' ? 'You: ' : 'AI: ';
      const truncated = msg.content.length > 200 ? msg.content.slice(0, 200) + '...' : msg.content;

      doc.setFontSize(8);
      doc.setFont('helvetica', msg.role === 'user' ? 'bold' : 'normal');
      doc.setTextColor(
        msg.role === 'user' ? 37 : 75,
        msg.role === 'user' ? 99 : 85,
        msg.role === 'user' ? 235 : 99
      );
      const lines = doc.splitTextToSize(`${prefix}${truncated}`, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 3.8 + 3;
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
