import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SessionConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  userNickname?: string;
}

const SessionConflictDialog: React.FC<SessionConflictDialogProps> = ({
  isOpen,
  onClose,
  message,
  userNickname
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <AlertDialogTitle className="text-gray-900 text-xl font-bold">
            บัญชีกำลังใช้งานอยู่
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 text-center space-y-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="font-medium text-yellow-800">
                🔒 {message}
              </p>
              {userNickname && (
                <p className="text-sm text-yellow-700 mt-2">
                  บัญชี: <strong>{userNickname}</strong>
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>💡 <strong>วิธีแก้ไข:</strong></p>
              <p>• ออกจากระบบในอุปกรณ์อื่นก่อน</p>
              <p>• รอสักครู่แล้วลองใหม่อีกครั้ง</p>
              <p>• ติดต่อผู้ดูแลหากยังมีปัญหา</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center">
          <AlertDialogAction
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white px-8"
          >
            เข้าใจแล้ว
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionConflictDialog;