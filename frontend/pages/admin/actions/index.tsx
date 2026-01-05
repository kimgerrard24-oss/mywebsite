// frontend/pages/admin/actions/index.tsx

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { sessionCheckServerSide } from '@/lib/api/api';
import { getAdminActions } from '@/lib/api/admin-actions';
import type { AdminAction } from '@/types/admin-action';
import AdminActionList from '@/components/admin/AdminActionList';
import AdminActionFilters from '@/components/admin/AdminActionFilters';

type Props = {
  items: AdminAction[];
  total: number;
};

export default function AdminActionsPage({
  items,
  total,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Actions</title>
      </Head>

      <main className="mx-auto max-w-3xl">
        <h1 className="px-4 py-4 text-xl font-semibold">
          Admin Actions ({total})
        </h1>

        <AdminActionFilters />

        <AdminActionList items={items} />
      </main>
    </>
  );

}

export const getServerSideProps: GetServerSideProps =
  async ({ req }) => {
    const session =
      await sessionCheckServerSide(
        req.headers.cookie,
      );

    if (!session.valid || session.role !== 'ADMIN') {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const data = await getAdminActions({
      page: 1,
      limit: 20,
    });

    return {
      props: {
        items: data.items,
        total: data.total,
      },
    };
  };
