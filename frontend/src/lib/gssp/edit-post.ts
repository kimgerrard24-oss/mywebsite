// frontend/src/lib/gssp/edit-post.ts

import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.query.id;

  if (typeof id !== 'string') {
    return { notFound: true };
  }

  const cookieHeader = ctx.req.headers.cookie ?? '';
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL!;

  // =================================================
  // 1) Session authority (backend only)
  // =================================================
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

  // =================================================
  // 2) Load post detail (viewer context)
  // =================================================
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

  if (!post || typeof post.visibility !== 'string') {
    return { notFound: true };
  }

  // =================================================
  // 3) Ownership guard (backend authority snapshot)
  // =================================================
  if (!post.canDelete) {
    return {
      redirect: {
        destination: `/posts/${id}`,
        permanent: false,
      },
    };
  }

  
  // =================================================
  // 4) Load visibility rules (OWNER ONLY)
  // =================================================
  const rulesRes = await fetch(
    `${apiBase}/posts/${id}/visibility-rules`,
    {
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
    },
  );

  if (!rulesRes.ok) {
    // fail-safe: do not allow edit if rules fetch failed
    return {
      redirect: {
        destination: `/posts/${id}`,
        permanent: false,
      },
    };
  }

  const rules = await rulesRes.json();
   if (
  !rules ||
  typeof rules.visibility !== 'string'
) {
  return {
    redirect: {
      destination: `/posts/${id}`,
      permanent: false,
    },
  };
}

  // =================================================
  // 5) Final props (backend authority)
  // =================================================
  return {
    props: {
      postId: id,
      content: post.content,

      initialVisibility: {
        visibility: post.visibility,
        includeUserIds: Array.isArray(rules.includeUserIds)
          ? rules.includeUserIds
          : [],
        excludeUserIds: Array.isArray(rules.excludeUserIds)
          ? rules.excludeUserIds
          : [],
      },
    },
  };
};

