import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AppShell from '../../components/layout/AppShell';
import { SuperAPI } from '../../api/endpoints';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Hospital Admin' | 'Clinician' | 'Receptionist' | 'Patient' | 'Support Staff';
  lastActive: string;
  hospital: string | null;
  hospital_id?: string | null;
};

const Users = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const limit = 6;

  // Fetch users - using mock API
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['super', 'users'],
    queryFn: async () => {
      try {
        const result = await SuperAPI.listUsers();
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching users:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users) || users.length === 0) return [];
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      (user.hospital && user.hospital.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  // Pagination
  const offset = (page - 1) * limit;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / limit));
  const paginatedUsers = filteredUsers.slice(offset, offset + limit);
  const startIndex = filteredUsers.length > 0 ? offset + 1 : 0;
  const endIndex = Math.min(offset + limit, filteredUsers.length);
  const totalResults = filteredUsers.length;

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
    toast.success('User created successfully!');
  };

  const handleEditSuccess = () => {
    setUserToEdit(null);
    queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
    toast.success('User updated successfully!');
  };

  const handleEdit = (user: User) => {
    setUserToEdit(user);
  };

  const formatLastActive = (lastActive: string) => {
    // If already formatted (e.g., "2 days ago"), return as is
    if (lastActive.includes('ago') || lastActive.includes('day') || lastActive.includes('week')) {
      return lastActive;
    }
    // Otherwise try to format from date string
    try {
      const date = new Date(lastActive);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 14) return '1 week ago';
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } catch {
      return lastActive;
    }
  };

  return (
    <AppShell role="super_admin">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">
              Users
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-soft"
            >
              <span className="material-symbols-outlined">person_add</span>
              Add New User
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
              search
            </span>
            <input
              type="text"
              placeholder="Search users by name, email or role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:border-primary focus:ring-primary focus:outline-none"
            />
          </div>
        </header>

        {/* Table */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
          {isLoading ? (
            <div className="text-center py-12 text-subtle-light dark:text-subtle-dark">
              Loading users...
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-2">Error loading users: {error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-subtle-light dark:text-subtle-dark">
              No users available. Create your first user to get started.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-border-light dark:border-border-dark">
                    <tr>
                      <th className="p-4 font-bold text-foreground-light dark:text-foreground-dark">NAME</th>
                      <th className="p-4 font-bold text-foreground-light dark:text-foreground-dark">EMAIL</th>
                      <th className="p-4 font-bold text-foreground-light dark:text-foreground-dark">ROLE</th>
                      <th className="p-4 font-bold text-foreground-light dark:text-foreground-dark">LAST ACTIVE</th>
                      <th className="p-4 font-bold text-foreground-light dark:text-foreground-dark">HOSPITAL</th>
                      <th className="p-4 font-bold text-foreground-light dark:text-foreground-dark"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-subtle-light dark:text-subtle-dark">
                          No users match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                        >
                          <td className="p-4 text-foreground-light dark:text-foreground-dark font-medium">{user.name}</td>
                          <td className="p-4 text-foreground-light dark:text-foreground-dark">{user.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                user.role === 'Super Admin'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-foreground-light dark:text-foreground-dark">{formatLastActive(user.lastActive)}</td>
                          <td className="p-4 text-foreground-light dark:text-foreground-dark">{user.hospital || 'N/A'}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-primary hover:text-primary/80 transition-colors font-medium"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Showing {startIndex} to {endIndex} of {totalResults} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                      let pageNum: number | string = i + 1;
                      
                      // Show first page, last page, current page, and pages around current
                      if (totalPages > 10) {
                        const currentPageNum = page;
                        if (i === 0) pageNum = 1;
                        else if (i === 9) pageNum = totalPages;
                        else if (i === 1 && currentPageNum > 4) pageNum = '...';
                        else if (i === 8 && currentPageNum < totalPages - 3) pageNum = '...';
                        else if (currentPageNum <= 4) pageNum = i + 1;
                        else if (currentPageNum >= totalPages - 3) pageNum = totalPages - 9 + i;
                        else pageNum = currentPageNum - 4 + i;
                      }
                      
                      if (pageNum === '...') {
                        return (
                          <span key={i} className="px-2 text-subtle-light dark:text-subtle-dark">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setPage(pageNum as number)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            page === pageNum
                              ? 'bg-primary text-white'
                              : 'hover:bg-subtle-light dark:hover:bg-subtle-dark text-foreground-light dark:text-foreground-dark'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Edit User Modal */}
      {userToEdit && (
        <EditUserModal
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </AppShell>
  );
};

export default Users;

