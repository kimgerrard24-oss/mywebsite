// frontend/src/components/account/PrivacySettingCard.tsx

import PrivacySettingToggle from "./PrivacyToggle";

type Props = {
  initialIsPrivate: boolean;
};

export default function PrivacySettingCard({
  initialIsPrivate,
}: Props) {
  return (
  <section
    className="w-full rounded-lg border bg-white p-4 sm:p-6 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
    role="region"
    aria-labelledby="privacy-setting-title"
  >
    <h2
      id="privacy-setting-title"
      className="sr-only"
    >
      Post privacy setting
    </h2>

    <PrivacySettingToggle initialIsPrivate={initialIsPrivate} />
  </section>
);

}
