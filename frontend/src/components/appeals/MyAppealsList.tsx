// frontend/src/components/appeals/MyAppealsList.tsx

import AppealItem from "./AppealItem";
import type { Appeal } from "@/types/appeal";

type Props = {
  appeals: Appeal[];
};

export default function MyAppealsList({
  appeals,
}: Props) {
  if (!appeals.length) {
    return (
      <p className="text-sm text-gray-600">
        You have not submitted any appeals.
      </p>
    );
  }

  return (
    <section
      aria-label="My appeals"
      className="space-y-3"
    >
      {appeals.map((a) => (
        <AppealItem key={a.id} appeal={a} />
      ))}
    </section>
  );
}
