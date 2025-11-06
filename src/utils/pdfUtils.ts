import html2pdf from 'html2pdf.js';

/**
 * Options for PDF generation
 */
export interface PDFGenerationOptions {
  filename?: string;
  margin?: number;
  image?: { type: 'jpeg' | 'png' | 'webp'; quality: number };
  html2canvas?: {
    scale: number;
    useCORS: boolean;
    logging: boolean;
  };
  jsPDF?: {
    unit: 'mm' | 'cm' | 'in' | 'px';
    format: 'a4' | 'letter' | string;
    orientation: 'portrait' | 'landscape';
  };
}

/**
 * Default PDF generation options
 */
const DEFAULT_PDF_OPTIONS: PDFGenerationOptions = {
  margin: 10,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 2,
    useCORS: true,
    logging: false
  },
  jsPDF: { 
    unit: 'mm', 
    format: 'a4', 
    orientation: 'portrait' 
  }
};

/**
 * Generate PDF from HTML element
 * @param element - The HTML element to convert to PDF
 * @param options - PDF generation options
 * @returns Promise that resolves with PDF Blob
 */
export async function generatePDF(
  element: HTMLElement, 
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options };
  
  try {
    // Generate PDF and return as blob
    const result = await html2pdf()
      .set(mergedOptions)
      .from(element)
      .outputPdf('blob');
    
    // Verify the result is a Blob
    if (!(result instanceof Blob)) {
      throw new Error('PDF generation did not return a valid Blob');
    }
    
    return result;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Download PDF from HTML element
 * @param element - The HTML element to convert to PDF
 * @param filename - Name of the downloaded file
 * @param options - PDF generation options
 */
export async function downloadPDF(
  element: HTMLElement, 
  filename: string,
  options: PDFGenerationOptions = {}
): Promise<void> {
  const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options, filename };
  
  try {
    await html2pdf()
      .set(mergedOptions)
      .from(element)
      .save();
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF. Please try again.');
  }
}

/**
 * Generate PDF and upload to backend
 * @param element - The HTML element to convert to PDF
 * @param invoiceId - The invoice ID
 * @param uploadFn - Function to upload the PDF blob to backend
 * @param options - PDF generation options
 */
export async function generateAndUploadPDF(
  element: HTMLElement,
  invoiceId: string,
  uploadFn: (invoiceId: string, pdfBlob: Blob) => Promise<void>,
  options: PDFGenerationOptions = {}
): Promise<void> {
  try {
    // Generate PDF as blob
    const pdfBlob = await generatePDF(element, options);
    
    // Upload to backend
    await uploadFn(invoiceId, pdfBlob);
  } catch (error) {
    console.error('Error generating and uploading PDF:', error);
    throw new Error('Failed to generate and upload PDF. Please try again.');
  }
}
