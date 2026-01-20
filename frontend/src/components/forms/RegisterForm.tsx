// frontend/src/components/forms/RegisterForm.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { registerUser } from '@/lib/api/auth';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    turnstile?: any;
  }
}

// ==============================
// Country list (ISO-3166-1 alpha-2)
// ==============================
export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AX', name: 'Åland Islands' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BV', name: 'Bouvet Island' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IO', name: 'British Indian Ocean Territory' },
  { code: 'BN', name: 'Brunei Darussalam' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CX', name: 'Christmas Island' },
  { code: 'CC', name: 'Cocos (Keeling) Islands' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Congo (Democratic Republic)' },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'TF', name: 'French Southern Territories' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GR', name: 'Greece' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GU', name: 'Guam' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HM', name: 'Heard Island and McDonald Islands' },
  { code: 'VA', name: 'Holy See (Vatican City State)' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KP', name: 'Korea (North)' },
  { code: 'KR', name: 'Korea (South)' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Lao People’s Democratic Republic' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MO', name: 'Macao' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NU', name: 'Niue' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PN', name: 'Pitcairn' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russian Federation' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'SH', name: 'Saint Helena' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'MF', name: 'Saint Martin' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syrian Arab Republic' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UM', name: 'United States Minor Outlying Islands' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Viet Nam' },
  { code: 'VG', name: 'Virgin Islands (British)' },
  { code: 'VI', name: 'Virgin Islands (U.S.)' },
  { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

// ==============================
// Password rule checker (frontend UX only)
// ==============================
function checkPasswordRules(pw: string) {
  const normalized = pw.normalize('NFKC');

  return {
    length: normalized.length >= 8,
    lower: /[a-z]/.test(normalized),
    upper: /[A-Z]/.test(normalized),
    digit: /[0-9]/.test(normalized),
    symbol: /[^a-zA-Z0-9]/.test(normalized),
  };
}

export default function RegisterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const rules = checkPasswordRules(passwordValue);

  const isStrongPassword =
  rules.length &&
  rules.lower &&
  rules.upper &&
  rules.digit &&
  rules.symbol;

  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<any>(null);
  const router = useRouter();

  // async resolver for turnstile token
  const tokenResolver = useRef<
    ((token: string | null) => void) | null
  >(null);

  // =================================================
  // Render Invisible Turnstile widget (client only)
  // =================================================
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        window.turnstile &&
        turnstileRef.current &&
        !widgetId.current
      ) {
        widgetId.current = window.turnstile.render(
          turnstileRef.current,
          {
            sitekey:
              process.env
                .NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
            size: 'invisible',

            callback: (token: string) => {
              tokenResolver.current?.(token);
            },

            'error-callback': () => {
              tokenResolver.current?.(null);
            },

            'timeout-callback': () => {
              tokenResolver.current?.(null);
            },
          },
        );
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // =================================================
  // Request Turnstile token
  // =================================================
  const getTurnstileToken = (): Promise<string | null> => {
    return new Promise((resolve) => {
      tokenResolver.current = resolve;

      if (window.turnstile && widgetId.current) {
        window.turnstile.execute(widgetId.current);
      } else {
        resolve(null);
      }
    });
  };

  // =================================================
  // Handle Register Submission
  // =================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const formEl = e.target as HTMLFormElement;
    const form = new FormData(formEl);

    const password = String(form.get('password') || '').normalize('NFKC');
    const confirmPassword = String(form.get('confirmPassword') || '').normalize('NFKC');

    // ---- Frontend UX validation only (backend is authority) ----
if (!isStrongPassword) {
  setError('Password does not meet security requirements.');
  setIsSubmitting(false);
  return;
}

if (password !== confirmPassword) {
  setError('Passwords do not match.');
  setIsSubmitting(false);
  return;
}


    const token = await getTurnstileToken();

    if (!token) {
      setError(
        'Captcha verification failed. Please try again.',
      );
      setIsSubmitting(false);
      return;
    }

    const payload = {
      email: String(form.get('email') || '').trim(),
      username: String(form.get('username') || '').trim(),
      displayName: String(
        form.get('displayName') || '',
      ).trim(),
      password,
      countryCode: String(
        form.get('countryCode') || '',
      ).trim() || undefined,
      dateOfBirth: form.get('dateOfBirth')
        ? new Date(
            String(form.get('dateOfBirth')),
          ).toISOString()
        : undefined,
      turnstileToken: token,
    };

    try {
      await registerUser(payload);

      setMessage(
        'Registration successful. Please check your email to verify your account.',
      );
      formEl.reset();
      setPasswordValue('');

      setTimeout(() => {
    router.replace('/');
  }, 1200);
    } catch (err: any) {
      setError(
        err?.message ||
          'Registration failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);

      if (window.turnstile && widgetId.current) {
        try {
          window.turnstile.reset(widgetId.current);
        } catch {}
      }
    }
  };

  return (
    <section
      aria-labelledby="register-title"
      className="w-full max-w-md mx-auto"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        {/* Invisible Turnstile Element */}
        <div ref={turnstileRef} />

        {/* ================= Email ================= */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            autoComplete="email"
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* ================= Username ================= */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lowercase letters and numbers only.
          </p>
        </div>

        {/* ================= Display Name ================= */}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium"
          >
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            autoComplete="name"
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* ================= Country + DOB ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="countryCode"
              className="block text-sm font-medium"
            >
              Country (optional)
            </label>
            <select
  id="countryCode"
  name="countryCode"
  defaultValue=""
  className="
    mt-1 w-full p-2 border rounded-md bg-white
    focus:outline-none focus:ring focus:ring-blue-300
  "
>
  <option value="">Select country (optional)</option>

  {COUNTRIES.map((c) => (
    <option key={c.code} value={c.code}>
      {c.name}
    </option>
  ))}
</select>

          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium"
            >
              Date of birth (optional)
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        {/* ================= Password ================= */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium"
          >
            Password
          </label>
          <input
  id="password"
  name="password"
  required
  type="password"
  autoComplete="new-password"
  value={passwordValue}
  onChange={(e) => setPasswordValue(e.target.value)}
  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"

/>

          <ul className="mt-1 text-xs space-y-1">
  <li className={rules.length ? 'text-green-600' : 'text-red-600'}>
    • At least 8 characters
  </li>
  <li className={rules.upper ? 'text-green-600' : 'text-red-600'}>
    • One uppercase letter (A–Z)
  </li>
  <li className={rules.lower ? 'text-green-600' : 'text-red-600'}>
    • One lowercase letter (a–z)
  </li>
  <li className={rules.digit ? 'text-green-600' : 'text-red-600'}>
    • One number (0–9)
  </li>
  <li className={rules.symbol ? 'text-green-600' : 'text-red-600'}>
    • One symbol (e.g. !@#$%)
  </li>
</ul>

        </div>

        {/* ================= Confirm Password ================= */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            required
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* ================= Submit ================= */}
        <button
  type="submit"
  disabled={isSubmitting || !isStrongPassword}
  className="
    w-full py-2.5 rounded-md
    text-white font-medium
    bg-blue-600 hover:bg-blue-700
    disabled:opacity-60 disabled:cursor-not-allowed
    transition
  "
>
  {isSubmitting ? 'Creating account…' : 'Create account'}
</button>

        {/* ================= Messages ================= */}
        {error && (
          <p
            role="alert"
            className="text-sm text-red-600 text-center"
          >
            {error}
          </p>
        )}

        {message && (
          <p className="text-sm text-green-700 text-center">
            {message}
          </p>
        )}

        <p className="text-xs text-gray-500 text-center mt-2">
          By creating an account, you agree to our Terms and Privacy
          Policy.
        </p>
      </form>
    </section>
  );
}

