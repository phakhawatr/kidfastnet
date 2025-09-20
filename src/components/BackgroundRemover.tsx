import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { removeBackground, loadImage } from '../utils/backgroundRemoval';

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setOriginalImage(imageUrl);
      setProcessedImage(null);
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    try {
      // Convert image URL to blob
      const response = await fetch(originalImage);
      const blob = await response.blob();
      
      // Load image
      const imageElement = await loadImage(blob);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('เกิดข้อผิดพลาดในการประมวลผลภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.download = 'image-no-background.png';
    link.href = processedImage;
    link.click();
  };

  return (
    <div className="card-glass p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
          🖼️ ลบพื้นหลังภาพ
        </h2>
        <p className="text-[hsl(var(--text-secondary))]">
          อัปโหลดภาพและลบพื้นหลังสีขาวด้วย AI
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Section */}
        <div className="text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="lg"
          >
            📁 เลือกภาพ
          </Button>
        </div>

        {/* Images Display */}
        {originalImage && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="text-center">
              <h3 className="font-semibold mb-3 text-[hsl(var(--text-primary))]">
                ภาพต้นฉบับ
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="max-w-full max-h-64 mx-auto object-contain"
                />
              </div>
            </div>

            {/* Processed Image */}
            <div className="text-center">
              <h3 className="font-semibold mb-3 text-[hsl(var(--text-primary))]">
                ภาพที่ลบพื้นหลังแล้ว
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gradient-to-br from-gray-100 to-gray-200" 
                   style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                {processedImage ? (
                  <img 
                    src={processedImage} 
                    alt="Processed" 
                    className="max-w-full max-h-64 mx-auto object-contain"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    {isProcessing ? (
                      <div className="text-center">
                        <div className="animate-spin text-2xl mb-2">⚙️</div>
                        <p>กำลังประมวลผล...</p>
                      </div>
                    ) : (
                      <p>กดปุ่มลบพื้นหลังเพื่อดูผลลัพธ์</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {originalImage && (
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleRemoveBackground}
              disabled={isProcessing}
              size="lg"
            >
              {isProcessing ? '⚙️ กำลังประมวลผล...' : '✨ ลบพื้นหลัง'}
            </Button>
            
            {processedImage && (
              <Button 
                onClick={downloadImage}
                variant="secondary"
                size="lg"
              >
                💾 ดาวน์โหลด
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundRemover;