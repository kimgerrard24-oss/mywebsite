// frontend/src/components/settings/PhoneChangeForm.tsx

import { useMemo, useState } from "react";
import {
  parsePhoneNumberFromString,
  getCountryCallingCode,
} from "libphonenumber-js";
import { requestPhoneChange } from "@/lib/api/user";
import type { CountryCode } from "libphonenumber-js";
import { PHONE_COUNTRIES } from "@/constants/phone-countries";

export default function PhoneChangeForm() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("TH");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCallingCode = useMemo(() => {
    try {
      return getCountryCallingCode(countryCode);
    } catch {
      return "";
    }
  }, [countryCode]);

  /* =====================================================
   * Submit
   * ===================================================== */
  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (loading) return;
  setError(null);
  setSuccess(false);


  const raw = phone.trim();

  if (!raw) {
    setError("Please enter your phone number");
    return;
  }

 const allowed = PHONE_COUNTRIES.some(
  (c) => c.code === countryCode,
);

if (!allowed) {
  setError("Invalid country selection");
  return;
}

    // ---------------------------------------------
    // Frontend validation (UX only — backend recheck)
    // ---------------------------------------------
    const normalized = raw.replace(/[^\d+]/g, "");
    const parsed = parsePhoneNumberFromString(normalized, countryCode);

    if (!parsed || !parsed.isValid()) {
      setError("Invalid phone number for selected country");
      return;
    }

    const e164 = parsed.number; // +66812345678

    try {
      setLoading(true);

      // ✅ keep API shape — backend still authority
      await requestPhoneChange({
        phone: e164,
        countryCode,
      });

      setSuccess(true);
      setPhone("");
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
      noValidate
    >
      {/* ================= Country ================= */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700"
        >
          Country
        </label>

        <select
        disabled={loading}
  id="country"
  value={countryCode}
  onChange={(e) =>
    setCountryCode(e.target.value as CountryCode)
  }
>
  {PHONE_COUNTRIES.map((c) => (
    <option key={c.code} value={c.code}>
      {c.name} ({c.callingCode})
    </option>
  ))}
</select>

      </div>

      {/* ================= Phone ================= */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone number
        </label>

        <div className="mt-1 flex rounded-md border border-gray-300 overflow-hidden">
          {selectedCallingCode && (
            <span
              className="
                inline-flex
                items-center
                px-3
                text-sm
                text-gray-600
                bg-gray-50
                border-r
              "
            >
              +{selectedCallingCode}
            </span>
          )}

          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            maxLength={20}
            onChange={(e) => {
  setPhone(e.target.value);
  if (error) setError(null);
}}

            placeholder="Enter phone number"
            className="
              flex-1
              px-3
              py-2
              outline-none
            "
          />
        </div>
      </div>

      {/* ================= Errors / Success ================= */}
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

      {/* ================= Submit ================= */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex
            items-center
            justify-center
            rounded-md
            bg-black
            px-5
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-gray-800
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Sending..." : "Send verification code"}
        </button>
      </div>
    </form>
  );
}
