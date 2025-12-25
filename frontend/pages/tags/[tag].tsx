// frontend/pages/tags/[tag].tsx

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import FeedList from '@/components/feed/FeedList';
import type { PostFeedItem } from '@/types/post-feed';
import { getPostsByTag } from '@/lib/api/posts';

type Props = {
  tag: string;
  items: PostFeedItem[];
};

export default function TagFeedPage({ tag, items }: Props) {
  return (
    <>
      <Head>
        <title>#{tag} | PhlyPhant</title>
        <meta
          name="description"
          content={`ดูโพสต์ทั้งหมดที่ติดแฮชแท็ก #${tag} บน PhlyPhant`}
        />
      </Head>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">#{tag}</h1>
        </header>

        <FeedList
          items={items}
          emptyText="ยังไม่มีโพสต์ในแฮชแท็กนี้"
        />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  req,
}) => {
  const tag = String(params?.tag ?? '').trim();

  if (!tag) {
    return { notFound: true };
  }

  try {
    const data = await getPostsByTag(tag, { req });

    return {
      props: {
        tag,
        items: data.items,
      },
    };
  } catch {
    // fail-soft (ตาม policy ระบบคุณ)
    return {
      props: {
        tag,
        items: [],
      },
    };
  }
};
