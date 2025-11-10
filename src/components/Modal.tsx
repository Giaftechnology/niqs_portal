import React from 'react';

type ModalProps = {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  closeText?: string;
};

const Modal: React.FC<ModalProps> = ({ open, title, children, onClose, onConfirm, confirmText = 'OK', closeText = 'Close' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-5">
        <div className="text-sm font-semibold text-gray-800 mb-2">{title}</div>
        {children && <div className="text-sm text-gray-600 mb-4">{children}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 border rounded-md text-sm">{closeText}</button>
          {onConfirm && (
            <button onClick={onConfirm} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">{confirmText}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
