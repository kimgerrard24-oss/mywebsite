// frontend/src/lib/gssp/edit-post.ts

import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.query.id;

  if (typeof id !== 'string') {
    return { notFound: true };
  }

  const cookieHeader = ctx.req.headers.cookie ?? '';
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL!;

  // 1) session authority
  const sessionRes = await fetch(`${apiBase}/auth/session-check`, {
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
  });

  if (!sessionRes.ok) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // 2) load post detail (with viewer context)
  const postRes = await fetch(`${apiBase}/posts/${id}`, {
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
  });

  if (!postRes.ok) {
    return { notFound: true };
  }

  const post = await postRes.json();

  // authority = backend only
  if (!post.canDelete) {
    return {
      redirect: {
        destination: `/posts/${id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      postId: id,
      content: post.content,
    },
  };
};
