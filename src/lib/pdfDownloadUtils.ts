import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

export interface PdfGenerationProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  message: string;
}

/**
 * Generates and directly downloads a high-fidelity multi-page PDF
 * by capturing each report page DOM node exactly as rendered on screen.
 * Uses html-to-image for full compatibility with modern CSS (oklch, CSS variables, etc.).
 */
export async function downloadReportAsPdf({
  reportContainerId = 'printable-report',
  filename = 'TM_Industrial_Vibration_Audit_Report.pdf',
  onProgress,
}: {
  reportContainerId?: string;
  filename?: string;
  onProgress?: (progress: PdfGenerationProgress) => void;
}): Promise<void> {
  const container = document.getElementById(reportContainerId);
  if (!container) {
    throw new Error(`Report container element #${reportContainerId} not found.`);
  }

  // Find all page containers
  const pageElements = Array.from(
    container.querySelectorAll<HTMLElement>('.report-page-container')
  );

  if (pageElements.length === 0) {
    throw new Error('No report pages found to generate PDF.');
  }

  const totalPages = pageElements.length;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm

  for (let i = 0; i < totalPages; i++) {
    const pageEl = pageElements[i];

    if (onProgress) {
      onProgress({
        currentPage: i + 1,
        totalPages,
        percentage: Math.round((i / totalPages) * 100),
        message: `Rendering Page ${i + 1} of ${totalPages}...`,
      });
    }

    // Capture the DOM element using html-to-image which natively supports oklch and modern CSS
    const imgData = await toJpeg(pageEl, {
      quality: 0.95,
      pixelRatio: 2, // 2x crisp retina print resolution
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipAutoScale: true,
    });

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // Add image fitting the full A4 canvas
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  if (onProgress) {
    onProgress({
      currentPage: totalPages,
      totalPages,
      percentage: 100,
      message: 'Compiling & Downloading PDF Document...',
    });
  }

  // Trigger browser direct download
  pdf.save(filename);
}
