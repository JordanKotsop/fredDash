import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  explanation?: string;
  conversationExcerpts?: { role: 'user' | 'assistant'; content: string }[];
  seriesLabels?: string[];
  dateRange?: string;
  generatedDate?: string;
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

function wrapText(doc: jsPDF, text: string, x: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    doc.text(line, x, doc.internal.pageSize.getHeight() > 0 ? 0 : 0); // placeholder
  }
  return lines.length * lineHeight;
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

  // Capture chart at 2x resolution
  const canvas = await html2canvas(chartElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');

  // Create PDF (Letter size)
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
  doc.setTextColor(17, 24, 39); // gray-900
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  y += 7;

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // gray-500
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

  // Check if chart fits on current page
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

    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(margin, y, contentW, 0.1, 2, 2, 'F'); // placeholder for height

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175); // blue-800
    y += 5;
    doc.text('What This Means', margin + 4, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 64, 175);
    const explanationLines = doc.splitTextToSize(explanation, contentW - 8);
    const boxH = explanationLines.length * 4.5 + 12;

    // Redraw the box with correct height
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y - 10, contentW, boxH, 2, 2, 'F');

    doc.text(explanationLines, margin + 4, y);
    y += explanationLines.length * 4.5 + 6;
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
      doc.setTextColor(msg.role === 'user' ? 37 : 75, msg.role === 'user' ? 99 : 85, msg.role === 'user' ? 235 : 99);
      const lines = doc.splitTextToSize(`${prefix}${truncated}`, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 3.8 + 3;
    }
  }

  // --- Footer ---
  const footerY = pageH - 10;
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(margin, footerY - 3, pageW - margin, footerY - 3);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text('Data Source: Federal Reserve Economic Data (FRED), Federal Reserve Bank of St. Louis', margin, footerY);
  doc.text('This report is for informational purposes only and does not constitute financial advice.', margin, footerY + 3.5);
  doc.text('FredDash — AI-Powered Economic Data Dashboard', pageW - margin, footerY, { align: 'right' });

  // --- Save ---
  const filename = `fredDash-${slugify(title)}-${formatDate()}.pdf`;
  doc.save(filename);
}
