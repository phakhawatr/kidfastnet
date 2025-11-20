import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface ExamLinkQRCodeProps {
  linkCode: string;
  onClose: () => void;
}

const ExamLinkQRCode = ({ linkCode, onClose }: ExamLinkQRCodeProps) => {
  const fullUrl = `${window.location.origin}/exam/${linkCode}`;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `exam-qr-${linkCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md card-glass">
        <CardHeader>
          <CardTitle className="text-center">QR Code ข้อสอบ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-6 rounded-lg flex justify-center">
            <QRCodeSVG
              id="qr-code-svg"
              value={fullUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">รหัสข้อสอบ</p>
            <p className="text-xl font-bold text-primary">{linkCode}</p>
          </div>

          <div className="text-xs text-muted-foreground text-center break-all">
            {fullUrl}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              ปิด
            </Button>
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลด PNG
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamLinkQRCode;
