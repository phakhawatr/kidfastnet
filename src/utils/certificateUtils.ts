import html2canvas from 'html2canvas';

export const downloadCertificate = async (elementRef: HTMLElement | null, filename: string) => {
  if (!elementRef) return;

  try {
    const canvas = await html2canvas(elementRef, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

export const shareCertificate = async (
  elementRef: HTMLElement | null,
  platform: 'facebook' | 'line' | 'twitter',
  score: number,
  nickname: string
) => {
  if (!elementRef) return;

  try {
    const canvas = await html2canvas(elementRef, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });

    const shareText = `ผมได้คะแนน ${score.toFixed(1)}% ในแบบทดสอบคณิตศาสตร์! 🎉`;
    
    switch (platform) {
      case 'facebook':
        // Facebook doesn't support direct image sharing via URL, so we open a post dialog
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
        break;
        
      case 'line':
        // LINE share text only (image sharing requires LINE API)
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + ' ' + window.location.href)}`;
        window.open(lineUrl, '_blank');
        break;
        
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        break;
    }

    // Also copy image to clipboard if supported
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        return true; // Successfully copied to clipboard
      } catch (error) {
        console.log('Clipboard copy not supported or failed:', error);
      }
    }
  } catch (error) {
    console.error('Error sharing certificate:', error);
    throw error;
  }
};

export const getShareableImageDataUrl = async (elementRef: HTMLElement | null): Promise<string> => {
  if (!elementRef) return '';

  try {
    const canvas = await html2canvas(elementRef, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};
