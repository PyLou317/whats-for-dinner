import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../pages/modals/ConfirmModal';
import { deleteProfileRequest } from '../api/deleteProfile';

export default function DeleteProfileSection() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteProfileRequest();

      // Optional: clear local auth state if your app stores tokens/user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      navigate('/goodbye'); // or "/" or "/login"
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      alert(msg);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <section className="mt-8 rounded-xl border border-red-200 p-4">
      <h3 className="text-base font-semibold text-red-700">Danger Zone</h3>
      <p className="mt-1 text-sm text-gray-600">
        Deleting your profile is permanent and cannot be undone.
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
      >
        Delete Profile
      </button>

      <ConfirmModal
        isOpen={open}
        title="Delete profile?"
        message="This will permanently delete your account, preferences, and saved data."
        confirmLabel="Yes, delete my profile"
        cancelLabel="Cancel"
        danger
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </section>
  );
}
