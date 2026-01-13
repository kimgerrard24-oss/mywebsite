// frontend/src/components/settings/PhoneChangeForm.tsx

import { useState } from "react";
import { requestPhoneChange } from "@/lib/api/user";

export default function PhoneChangeForm() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("TH");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    try {
      setLoading(true);
      await requestPhoneChange({
        phone,
        countryCode,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.body?.message ??
          "Failed to send verification code",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
      aria-label="Change phone number"
    >
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700"
        >
          Country
        </label>
        <select
          id="country"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="TH">Thailand</option>
          <option value="US">United States</option>
          <option value="JP">Japan</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0812345678"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p
          className="text-sm text-green-600"
          role="status"
          aria-live="polite"
        >
          Verification code has been sent to your phone.
        </p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex items-center justify-center
            rounded-md bg-black px-5 py-2
            text-sm font-medium text-white
            hover:bg-gray-800
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Sending..." : "Send verification code"}
        </button>
      </div>
    </form>
  );
}
