import type { ReactNode } from 'react';
import Link from 'next/link';

type Props = {
  children: ReactNode;
};

export default function ProfileLayout({ children }: Props) {
  return (
    <>
      <header>
        <nav>
          <Link href="/">Home</Link>
        </nav>
      </header>

      {children}

      <footer>
        <p>© {new Date().getFullYear()} PhlyPhant</p>
      </footer>
    </>
  );
}
