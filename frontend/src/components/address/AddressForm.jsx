import React, { useState, useEffect } from 'react';
import { FiHome, FiBriefcase, FiMapPin, FiUser, FiPhone, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

/**
 * AddressForm — Reusable form for creating and editing user addresses.
 *
 * @param {{
 *   initialValues?: Object,
 *   onSubmit: (data: Object) => Promise<void>,
 *   onCancel: () => void,
 *   isSaving?: boolean,
 *   title?: string
 * }} props
 */
export const AddressForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isSaving = false,
  title = null
}) => {
  const [formData, setFormData] = useState({
    addressType: 'HOME',
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        addressType: initialValues.addressType || 'HOME',
        fullName: initialValues.fullName || '',
        phoneNumber: initialValues.phoneNumber || '',
        addressLine1: initialValues.addressLine1 || '',
        addressLine2: initialValues.addressLine2 || '',
        landmark: initialValues.landmark || '',
        city: initialValues.city || '',
        state: initialValues.state || '',
        pincode: initialValues.pincode || '',
        isDefault: Boolean(initialValues.isDefault),
      });
    }
  }, [initialValues]);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const cleanPhone = formData.phoneNumber.replace(/[\s+-]/g, '');
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      newErrors.phoneNumber = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address / House no. is required';
    } else if (formData.addressLine1.trim().length < 3) {
      newErrors.addressLine1 = 'Address line 1 must be at least 3 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit Indian PIN code';
    }

    return newErrors;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitError(null);
    try {
      await onSubmit({
        ...formData,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2 ? formData.addressLine2.trim() : null,
        landmark: formData.landmark ? formData.landmark.trim() : null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to save address. Please verify your details.');
    }
  };

  const inputClasses = (field) =>
    `w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:bg-white ${
      errors[field]
        ? 'border-rose-300 focus:ring-rose-200'
        : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-300'
    }`;

  const addressTypes = [
    { value: 'HOME', label: 'Home', icon: FiHome },
    { value: 'WORK', label: 'Work', icon: FiBriefcase },
    { value: 'OTHER', label: 'Other', icon: FiMapPin },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {title && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              aria-label="Cancel"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {submitError && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Address Type Selection */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Address Type
        </label>
        <div className="flex gap-2">
          {addressTypes.map(({ value, label, icon: Icon }) => {
            const isSelected = formData.addressType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, addressType: value }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Name & Phone Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="fullName">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              id="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange('fullName')}
              placeholder="Full name"
              className={`${inputClasses('fullName')} pl-9`}
              maxLength={100}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <FiAlertCircle className="w-3 h-3" /> {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="phoneNumber">
            Mobile Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              id="phoneNumber"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={handleChange('phoneNumber')}
              placeholder="10-digit mobile number"
              className={`${inputClasses('phoneNumber')} pl-9`}
              maxLength={15}
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <FiAlertCircle className="w-3 h-3" /> {errors.phoneNumber}
            </p>
          )}
        </div>
      </div>

      {/* Address Line 1 */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="addressLine1">
          Flat, House no., Building, Company, Apartment <span className="text-rose-500">*</span>
        </label>
        <input
          id="addressLine1"
          type="text"
          required
          value={formData.addressLine1}
          onChange={handleChange('addressLine1')}
          placeholder="e.g. Flat 402, Green Valley Apts"
          className={inputClasses('addressLine1')}
          maxLength={255}
        />
        {errors.addressLine1 && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
            <FiAlertCircle className="w-3 h-3" /> {errors.addressLine1}
          </p>
        )}
      </div>

      {/* Address Line 2 & Landmark */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="addressLine2">
            Area, Street, Sector, Village <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            id="addressLine2"
            type="text"
            value={formData.addressLine2}
            onChange={handleChange('addressLine2')}
            placeholder="e.g. MG Road, Shivaji Nagar"
            className={inputClasses('addressLine2')}
            maxLength={255}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="landmark">
            Landmark <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            id="landmark"
            type="text"
            value={formData.landmark}
            onChange={handleChange('landmark')}
            placeholder="e.g. Near City Mall"
            className={inputClasses('landmark')}
            maxLength={150}
          />
        </div>
      </div>

      {/* City, State, Pincode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="city">
            City / Town <span className="text-rose-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            required
            value={formData.city}
            onChange={handleChange('city')}
            placeholder="e.g. Pune"
            className={inputClasses('city')}
            maxLength={100}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <FiAlertCircle className="w-3 h-3" /> {errors.city}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="state">
            State <span className="text-rose-500">*</span>
          </label>
          <select
            id="state"
            required
            value={formData.state}
            onChange={handleChange('state')}
            className={inputClasses('state')}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <FiAlertCircle className="w-3 h-3" /> {errors.state}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pincode">
            6-digit Pincode <span className="text-rose-500">*</span>
          </label>
          <input
            id="pincode"
            type="text"
            required
            value={formData.pincode}
            onChange={handleChange('pincode')}
            placeholder="e.g. 411001"
            className={inputClasses('pincode')}
            maxLength={6}
          />
          {errors.pincode && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <FiAlertCircle className="w-3 h-3" /> {errors.pincode}
            </p>
          )}
        </div>
      </div>

      {/* Set Default Address Checkbox */}
      <div className="pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={handleChange('isDefault')}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-medium text-gray-700">
            Make this my default delivery address
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <FiCheck className="w-4 h-4" />
          {isSaving ? 'Saving...' : initialValues ? 'Update Address' : 'Save Address'}
        </button>
      </div>
    </form>
  );
};
