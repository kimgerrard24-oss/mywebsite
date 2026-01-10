// frontend/src/components/common/NoIndex.tsx


import Head from 'next/head';

export default function NoIndex() {
  return (
    <Head>
      <meta name="robots" content="noindex,nofollow" />
    </Head>
  );
}
