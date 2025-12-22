import type { ReactNode } from 'react';
import Link from 'next/link';

type Props = {
  children: ReactNode;
};

export default function ProfileLayout({ children }: Props) {
  return (
    <>

      {children}

      <footer>
        <p>© {new Date().getFullYear()} PhlyPhant</p>
      </footer>
    </>
  );
}
