import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { AddressForm } from './AddressForm';

/**
 * AddressModal — Modal dialog containing the AddressForm.
 * Supports ESC key close, backdrop click close, and clean exit animations.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   initialValues?: Object,
 *   onSubmit: (data: Object) => Promise<void>,
 *   isSaving?: boolean,
 *   title?: string
 * }} props
 */
export const AddressModal = ({
  isOpen,
  onClose,
  initialValues = null,
  onSubmit,
  isSaving = false,
  title = 'Add Delivery Address'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
    >
      {/* Clickable Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-100 p-6 z-10 animate-scale">
        <AddressForm
          title={title}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};
