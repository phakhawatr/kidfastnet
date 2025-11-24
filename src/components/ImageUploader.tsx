import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  teacherId: string;
  initialImages?: string[];
}

export default function ImageUploader({ onImagesChange, maxImages = 5, teacherId, initialImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update images when initialImages prop changes
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > maxImages) {
      toast({
        title: 'จำนวนรูปภาพเกิน',
        description: `สามารถอัพโหลดได้สูงสุด ${maxImages} รูป`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Compress image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        return new Promise<string>((resolve, reject) => {
          img.onload = async () => {
            // Max dimensions
            const maxWidth = 800;
            const maxHeight = 800;
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            // Convert to base64
            const base64 = canvas.toDataURL('image/jpeg', 0.8);

            // Upload via edge function
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ image: base64, teacherId }),
              }
            );

            if (!response.ok) {
              throw new Error('Upload failed');
            }

            const data = await response.json();
            resolve(data.url);
          };

          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);

      toast({
        title: 'อัพโหลดสำเร็จ',
        description: `อัพโหลดรูปภาพ ${uploadedUrls.length} รูป`,
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}
        </Button>
        <span className="text-sm text-muted-foreground">
          ({images.length}/{maxImages} รูป)
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">ยังไม่มีรูปภาพ</p>
        </div>
      )}
    </div>
  );
}