import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'landscape' | 'portrait';
  onProgress?: (progress: number) => void;
}

export const exportPresentationToPdf = async (
  slidesContainer: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> => {
  const {
    filename = 'KidFastAI-Presentation.pdf',
    orientation = 'landscape',
    onProgress
  } = options;

  const slides = slidesContainer.querySelectorAll('[data-slide]') as NodeListOf<HTMLElement>;
  
  if (slides.length === 0) {
    throw new Error('No slides found');
  }

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    // Report progress
    if (onProgress) {
      onProgress(((i + 1) / slides.length) * 100);
    }

    try {
      const canvas = await html2canvas(slide, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: slide.offsetWidth,
        height: slide.offsetHeight
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit the PDF page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
    } catch (error) {
      console.error(`Error capturing slide ${i + 1}:`, error);
    }
  }

  pdf.save(filename);
};

export const exportSingleSlideToPdf = async (
  slideElement: HTMLElement,
  filename: string = 'slide.pdf'
): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const canvas = await html2canvas(slideElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  
  const scaledWidth = imgWidth * ratio;
  const scaledHeight = imgHeight * ratio;
  const x = (pdfWidth - scaledWidth) / 2;
  const y = (pdfHeight - scaledHeight) / 2;

  pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
  pdf.save(filename);
};
