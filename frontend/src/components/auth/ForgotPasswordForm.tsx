// frontend/components/auth/ForgotPasswordForm.tsx
import React, { useState, FormEvent } from 'react';
import { requestPasswordReset } from '@/lib/api/auth';

const emailRegex =
  // ไม่ต้อง perfect ระดับ RFC แต่พอสำหรับ frontend validation
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage(null);
    setErrorMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const message = await requestPasswordReset(trimmedEmail);
      setSuccessMessage(message);
      // ไม่จำเป็นต้องเคลียร์ email เพื่อให้ user แก้ไขได้ถ้าพิมพ์ผิด
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

return (
  <section
    aria-labelledby="forgot-password-heading"
    className="
      mx-auto
      w-full
      max-w-sm
      sm:max-w-md
      rounded-xl
      sm:rounded-2xl
      border
      border-gray-200
      bg-white
      p-5
      sm:p-6
      md:p-8
      shadow-sm
    "
  >
    <header className="mb-5 sm:mb-6 text-center">
      <h1
        id="forgot-password-heading"
        className="
          text-lg
          sm:text-xl
          md:text-2xl
          font-semibold
          tracking-tight
          text-gray-900
        "
      >
        Forgot your password?
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-gray-600">
        Enter the email associated with your account and we&apos;ll send you a
        link to reset your password.
      </p>
    </header>

    <form
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={
        successMessage ? 'forgot-success-message' : 'forgot-error-message'
      }
      className="space-y-4 sm:space-y-5"
    >
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="
            block
            text-xs
            sm:text-sm
            font-medium
            text-gray-800
          "
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="
            block
            w-full
            rounded-lg
            sm:rounded-xl
            border
            border-gray-300
            px-3
            py-2
            sm:py-2.5
            text-sm
            text-gray-900
            shadow-sm
            outline-none
            transition
            focus-visible:border-blue-500
            focus-visible:ring-2
            focus-visible:ring-blue-500/40
          "
        />
      </div>

      {errorMessage && (
        <p
          id="forgot-error-message"
          role="alert"
          className="
            text-xs
            sm:text-sm
            text-red-600
          "
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          id="forgot-success-message"
          role="status"
          aria-live="polite"
          className="
            text-xs
            sm:text-sm
            text-emerald-700
          "
        >
          {successMessage}
        </p>
      )}

      <div className="pt-1 sm:pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            rounded-lg
            sm:rounded-xl
            bg-blue-600
            px-4
            py-2.5
            sm:py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-colors
            hover:bg-blue-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
            focus-visible:ring-offset-2
            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        >
          {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
        </button>
      </div>
    </form>

    <footer className="mt-5 sm:mt-6 text-center text-[11px] sm:text-xs text-gray-500">
      For your security, we&apos;ll never tell you whether an email is registered
      on this site.
    </footer>
  </section>
);

};

export default ForgotPasswordForm;
