// frontend/src/components/search/UserSearchResults.tsx

import UserSearchList from '@/components/users/UserSearchList';
import type { SearchUserItem } from '@/lib/api/search-users';

type Props = {
  query: string;
  loading: boolean;
  error: string | null;
  users: SearchUserItem[];
  variant?: 'feed' | 'page' | 'navbar';
};

/**
 * Adapter:
 * /search/users → UserSearchList
 */
export default function UserSearchResults({
  query,
  loading,
  error,
  users,
  variant,
}: Props) {
  return (
    <UserSearchList
      query={query}
      loading={loading}
      error={error}
      users={users}
      variant={variant}
    />
  );
}
