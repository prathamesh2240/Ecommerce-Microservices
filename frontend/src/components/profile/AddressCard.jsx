import React, { useState, useEffect, useCallback } from 'react';
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiBriefcase,
  FiCheck,
  FiPhone,
  FiAlertTriangle,
  FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { addressService } from '../../services/addressService';
import { AddressModal } from '../address/AddressModal';

/**
 * AddressCard — Displays a single saved address with management actions.
 */
export const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault = false
}) => {
  const isDefault = Boolean(address.isDefault);

  const getIcon = (type) => {
    switch (type) {
      case 'WORK':
        return <FiBriefcase className="w-3.5 h-3.5" />;
      case 'OTHER':
        return <FiMapPin className="w-3.5 h-3.5" />;
      case 'HOME':
      default:
        return <FiHome className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`border rounded-2xl p-5 transition-all duration-150 flex flex-col justify-between ${
        isDefault
          ? 'border-indigo-200 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500/20'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div>
        {/* Type & Default Badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gray-100/80 text-gray-700 text-xs font-bold uppercase tracking-wider">
            {getIcon(address.addressType)}
            <span>{address.addressType ?? 'HOME'}</span>
          </div>

          {isDefault && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
              <FiCheck className="w-3 h-3" />
              Default
            </span>
          )}
        </div>

        {/* Recipient Details */}
        <p className="text-base font-bold text-gray-900 mb-0.5">{address.fullName}</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>
        {address.landmark && (
          <p className="text-xs text-gray-400 mt-0.5">
            Landmark: {address.landmark}
          </p>
        )}
        <p className="text-sm font-medium text-gray-700 mt-0.5">
          {address.city}, {address.state} — <span className="font-mono font-bold">{address.pincode}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <FiPhone className="w-3 h-3 text-gray-400" />
          <span>+91 {address.phoneNumber}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-indigo-50 transition"
          aria-label={`Edit address for ${address.fullName}`}
        >
          <FiEdit2 className="w-3 h-3" /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(address)}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 transition"
          aria-label={`Delete address for ${address.fullName}`}
        >
          <FiTrash2 className="w-3 h-3" /> Remove
        </button>

        {!isDefault && (
          <button
            type="button"
            onClick={() => onSetDefault(address.id)}
            disabled={isSettingDefault}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 ml-auto py-1 px-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            {isSettingDefault ? 'Setting...' : 'Set as Default'}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * DeleteConfirmModal — Accessible confirmation modal for address deletion.
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, address, isDeleting }) => {
  if (!isOpen || !address) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 z-10 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <FiAlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-900">Delete this address?</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Are you sure you want to remove the address for <strong className="text-gray-700">{address.fullName}</strong> ({address.city})?
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * AddressSection — Full address management section for the Profile Page.
 * Real backend API integration for listing, adding, editing, deleting, and setting defaults.
 */
export const AddressSection = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [settingDefaultId, setSettingDefaultId] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressService.getMyAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load your saved addresses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleSaveAddress = async (formData) => {
    try {
      setIsSaving(true);
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, formData);
        toast.success('Address updated successfully!');
      } else {
        await addressService.createAddress(formData);
        toast.success('Address added successfully!');
      }
      setModalOpen(false);
      fetchAddresses();
    } catch (err) {
      throw err; // Handled by AddressForm to show inline submit error
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (addr) => {
    setAddressToDelete(addr);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      setIsDeleting(true);
      await addressService.deleteAddress(addressToDelete.id);
      toast.success('Address removed successfully.');
      setDeleteModalOpen(false);
      setAddressToDelete(null);
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete address.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setSettingDefaultId(addressId);
      await addressService.setDefaultAddress(addressId);
      toast.success('Default address updated!');
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to set default address.');
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Saved Addresses</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your delivery and billing locations for faster checkout
          </p>
        </div>
        <button
          id="add-address-button"
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-600 space-y-3">
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchAddresses}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl hover:bg-rose-100 transition"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onSetDefault={handleSetDefault}
                isSettingDefault={settingDefaultId === addr.id}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600">
              <FiMapPin className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-1">No saved addresses yet</h4>
            <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">
              Add a delivery address to make your checkout experience fast and seamless.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Your First Address</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialValues={editingAddress}
        onSubmit={handleSaveAddress}
        isSaving={isSaving}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        address={addressToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
