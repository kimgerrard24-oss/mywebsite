// frontend/components/auth/ResetPasswordForm.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  resetPassword,
  type ResetPasswordPayload,
} from '@/lib/api/auth';

interface ResetPasswordFormProps {
  token: string | null;
  email: string | null;
}

const MIN_PASSWORD_LENGTH = 8;

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, email }) => {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasInvalidLink = !token || !email;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasInvalidLink) {
      setError(
        'The reset link is invalid. Please request a new password reset email.',
      );
      return;
    }

    setError(null);
    setFieldError(null);
    setSuccessMessage(null);

    if (!password || !confirmPassword) {
      setFieldError('Please fill in all required fields.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFieldError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setFieldError('Password and confirmation do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: ResetPasswordPayload = {
        email,
        token,
        newPassword: password,
        confirmPassword,
      };

      const message = await resetPassword(payload);
      setSuccessMessage(message || 'Your password has been updated.');

      // Redirect to success page after short delay
      setTimeout(() => {
        router.replace('/reset-password-success');
      }, 1500);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to reset your password. Please try again later.';

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

 return (
  <section
    aria-labelledby="reset-password-heading"
    className="
      w-full
      max-w-sm
      sm:max-w-md
      md:max-w-lg
      bg-white
      shadow-md
      sm:shadow-lg
      rounded-lg
      sm:rounded-xl
      p-6
      sm:p-8
      mx-auto
    "
  >
    <header className="mb-5 sm:mb-6">
      <h1
        id="reset-password-heading"
        className="
          text-xl
          sm:text-2xl
          md:text-3xl
          font-bold
          text-gray-900
          mb-2
          leading-tight
        "
      >
        Reset your password
      </h1>

      <p className="text-sm sm:text-base text-gray-600">
        Set a new password for your PhlyPhant account.
      </p>
    </header>

    {hasInvalidLink && (
      <div
        role="alert"
        className="
          mb-4
          rounded-md
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-xs
          sm:text-sm
          text-red-700
        "
      >
        The reset link is invalid or missing. Please request a new password
        reset email from the login page.
      </div>
    )}

    {fieldError && (
      <div
        role="alert"
        className="
          mb-4
          rounded-md
          border
          border-yellow-200
          bg-yellow-50
          px-4
          py-3
          text-xs
          sm:text-sm
          text-yellow-800
        "
      >
        {fieldError}
      </div>
    )}

    {error && (
      <div
        role="alert"
        className="
          mb-4
          rounded-md
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-xs
          sm:text-sm
          text-red-700
        "
      >
        {error}
      </div>
    )}

    {successMessage && (
      <div
        role="status"
        className="
          mb-4
          rounded-md
          border
          border-green-200
          bg-green-50
          px-4
          py-3
          text-xs
          sm:text-sm
          text-green-700
        "
      >
        {successMessage}
      </div>
    )}

    <form
      className="space-y-4 sm:space-y-5"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Email (read-only) */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-xs sm:text-sm font-medium text-gray-700"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email ?? ''}
          readOnly
          aria-readonly="true"
          className="
            w-full
            rounded-md
            border
            border-gray-300
            bg-gray-100
            px-3
            py-2
            text-sm
            text-gray-700
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        />

        <p className="text-[11px] sm:text-xs text-gray-500">
          This email is associated with your reset link and cannot be changed.
        </p>
      </div>

      {/* New password */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="new-password"
          className="text-xs sm:text-sm font-medium text-gray-700"
        >
          New password
        </label>

        <input
          id="new-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={MIN_PASSWORD_LENGTH}
          className="
            w-full
            rounded-md
            border
            border-gray-300
            px-3
            py-2
            text-sm
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        />

        <p className="text-[11px] sm:text-xs text-gray-500 leading-snug">
          Use at least {MIN_PASSWORD_LENGTH} characters, including uppercase,
          lowercase, numbers, and symbols.
        </p>
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="confirm-password"
          className="text-xs sm:text-sm font-medium text-gray-700"
        >
          Confirm new password
        </label>

        <input
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={MIN_PASSWORD_LENGTH}
          className="
            w-full
            rounded-md
            border
            border-gray-300
            px-3
            py-2
            text-sm
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        />
      </div>

      <button
        type="submit"
        disabled={submitting || hasInvalidLink}
        className="
          mt-2
          inline-flex
          w-full
          items-center
          justify-center
          rounded-md
          bg-blue-600
          px-4
          py-2.5
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-blue-700
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-blue-500
          disabled:cursor-not-allowed
          disabled:bg-gray-400
        "
      >
        {submitting ? 'Updating password...' : 'Update password'}
      </button>

      <p className="mt-3 text-center text-[11px] sm:text-xs text-gray-500">
        If you did not request this change, you can ignore this page.
      </p>
    </form>
  </section>
);

};

export default ResetPasswordForm;
