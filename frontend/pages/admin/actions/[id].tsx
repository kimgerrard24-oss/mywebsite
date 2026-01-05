// frontend/pages/admin/actions/[id].tsx

import type { GetServerSideProps } from 'next';
import { sessionCheckServerSide } from '@/lib/api/api';
import { getAdminActionById } from '@/lib/api/admin-actions';
import type { AdminAction } from '@/types/admin-action';
import AdminActionDetail from '@/components/admin/AdminActionDetail';

type Props = {
  action: AdminAction;
};

export default function AdminActionPage({
  action,
}: Props) {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        Admin Action Detail
      </h1>

      <AdminActionDetail action={action} />
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const session =
    await sessionCheckServerSide(
      ctx.req.headers.cookie,
    );

  if (!session.valid || session.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const id = ctx.params?.id as string;

  try {
    const action = await getAdminActionById(id);
    return { props: { action } };
  } catch {
    return { notFound: true };
  }
};
