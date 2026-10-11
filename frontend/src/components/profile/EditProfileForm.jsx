import React, { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

/**
 * EditProfileForm — Inline form for updating profile details.
 * Handles validation, loading state, and cancellation.
 *
 * @param {{ profile: UserResponse, onSave: (data) => Promise<void>, onCancel: () => void }} props
 */
export const EditProfileForm = ({ profile, onSave, onCancel }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phoneNumber: profile.phoneNumber ?? '',
      });
    }
  }, [profile]);

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (form.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be 50 characters or fewer';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (form.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be 50 characters or fewer';
    }

    if (form.phoneNumber && !/^[6-9]\d{9}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid 10-digit Indian mobile number';
    }

    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setSaveError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
      });
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:bg-white ${
      errors[field]
        ? 'border-rose-300 focus:ring-rose-200'
        : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-300'
    }`;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Edit Profile</h3>
          <p className="text-xs text-gray-500 mt-0.5">Update your personal information</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Cancel editing"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="px-6 py-5 space-y-4">
          {/* Save Error */}
          {saveError && (
            <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">
              <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          {/* First Name + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="firstName">
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  id="firstName"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  placeholder="Enter first name"
                  className={`${inputClass('firstName')} pl-9`}
                  maxLength={50}
                  autoComplete="given-name"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" /> {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="lastName">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  id="lastName"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  placeholder="Enter last name"
                  className={`${inputClass('lastName')} pl-9`}
                  maxLength={50}
                  autoComplete="family-name"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" /> {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="phoneNumber">
              Mobile Number
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                id="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange('phoneNumber')}
                placeholder="e.g. 9876543210"
                className={`${inputClass('phoneNumber')} pl-9`}
                maxLength={10}
                autoComplete="tel"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" /> {errors.phoneNumber}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              10-digit Indian mobile number
            </p>
          </div>

          {/* Note: Email is not editable */}
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
            Email address cannot be changed from this screen. Contact support if needed.
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="save-profile-button"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <FiCheck className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
