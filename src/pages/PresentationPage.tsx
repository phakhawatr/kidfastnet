import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { exportPresentationToPdf } from '@/utils/presentationPdfUtils';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Import all slides
import Slide1Cover from '@/components/presentation/slides/Slide1Cover';
import Slide2Problem from '@/components/presentation/slides/Slide2Problem';
import Slide3Solution from '@/components/presentation/slides/Slide3Solution';
import Slide4Students from '@/components/presentation/slides/Slide4Students';
import Slide5School from '@/components/presentation/slides/Slide5School';
import Slide6AI from '@/components/presentation/slides/Slide6AI';
import Slide7Business from '@/components/presentation/slides/Slide7Business';
import Slide8Roadmap from '@/components/presentation/slides/Slide8Roadmap';

const PresentationPage: React.FC = () => {
  const { t, i18n } = useTranslation('presentation');
  const navigate = useNavigate();
  const slidesRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownloadPdf = async () => {
    if (!slidesRef.current || isGenerating) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      await exportPresentationToPdf(slidesRef.current, {
        filename: `KidFastAI-Presentation-${i18n.language.toUpperCase()}.pdf`,
        orientation: 'landscape',
        onProgress: (p) => setProgress(p)
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับหน้าหลัก
            </Button>
            <h1 className="text-xl font-bold text-gray-800">
              KidFastAI Investor Presentation
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('generating')} ({Math.round(progress)}%)
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t('downloadPdf')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Slides Container */}
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div ref={slidesRef} className="space-y-8">
          <Slide1Cover />
          <Slide2Problem />
          <Slide3Solution />
          <Slide4Students />
          <Slide5School />
          <Slide6AI />
          <Slide7Business />
          <Slide8Roadmap />
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-gray-500 text-sm">
        © 2025 KidFastAI - All Rights Reserved
      </div>
    </div>
  );
};

export default PresentationPage;
