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
      className="rounded-lg border bg-white p-4"
      aria-labelledby="privacy-setting-title"
    >
      <h2 id="privacy-setting-title" className="sr-only">
        Post privacy setting
      </h2>

      <PrivacySettingToggle initialIsPrivate={initialIsPrivate} />
    </section>
  );
}
