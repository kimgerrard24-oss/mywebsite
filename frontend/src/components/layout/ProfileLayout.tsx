// frontend/src/components/layout/ProfileLayout.tsx

import type { ReactNode } from 'react';
import Link from 'next/link';

type Props = {
  children: ReactNode;
};

export default function ProfileLayout({ children }: Props) {
 return (
  <>
    {children}

    <footer
      className="
        mt-8
        sm:mt-10
        md:mt-12
        border-t
        border-gray-200
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          sm:px-6
          py-4
          sm:py-6
          text-center
        "
      >
        <p
          className="
            text-xs
            sm:text-sm
            text-gray-500
          "
        >
          © {new Date().getFullYear()} PhlyPhant
        </p>
      </div>
    </footer>
  </>
 );

}
