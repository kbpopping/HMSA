import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AppShell from '../../components/layout/AppShell';
import { SuperAPI } from '../../api/endpoints';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import { useNotifications } from '../../store/notifications';

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

  const { addNotification } = useNotifications();

  const handleAddSuccess = (userData?: { name: string; email: string; role: string }) => {
    setIsAddModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
    toast.success('User created successfully!');
    
    // Add notification
    if (userData) {
      addNotification({
        type: 'user_added',
        title: 'New User Added',
        message: `User "${userData.name}" (${userData.email}) has been added with role "${userData.role}".`,
        route: '/super/users',
      });
      
      if (userData.role === 'Hospital Admin') {
        addNotification({
          type: 'hospital_admin_added',
          title: 'Hospital Admin Created',
          message: `New hospital admin "${userData.name}" has been created.`,
          route: '/super/users',
        });
      }
    }
  };

  const handleEditSuccess = (userData?: { name: string; email: string; role: string; previousRole?: string; isDelete?: boolean }) => {
    if (userData?.isDelete) {
      // User was deleted
      addNotification({
        type: 'user_deleted',
        title: 'User Deleted',
        message: `User "${userData.name}" (${userData.email}) has been removed from the system.`,
        route: '/super/users',
      });
      
      if (userData.role === 'Hospital Admin') {
        addNotification({
          type: 'hospital_admin_deleted',
          title: 'Hospital Admin Removed',
          message: `Hospital admin "${userData.name}" has been removed.`,
          route: '/super/users',
        });
      }
    } else if (userData?.previousRole && userData.previousRole !== userData.role) {
      // Role was changed
      addNotification({
        type: 'role_changed',
        title: 'User Role Changed',
        message: `User "${userData.name}" role has been changed from "${userData.previousRole}" to "${userData.role}".`,
        route: '/super/users',
      });
    } else if (!userData?.previousRole && userData?.role) {
      // Role was assigned (new user)
      addNotification({
        type: 'role_assigned',
        title: 'Role Assigned',
        message: `Role "${userData.role}" has been assigned to user "${userData.name}".`,
        route: '/super/users',
      });
    }
    
    setUserToEdit(null);
    queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
    toast.success(userData?.isDelete ? 'User deleted successfully!' : 'User updated successfully!');
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
        <header className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
              Users
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto bg-primary text-white px-4 sm:px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-soft text-sm sm:text-base touch-manipulation"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">person_add</span>
              Add New User
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-lg sm:text-xl">
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
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:border-primary focus:ring-primary focus:outline-none text-sm sm:text-base"
            />
          </div>
        </header>

        {/* Table */}
        <div className="bg-card-light dark:bg-card-dark p-3 sm:p-4 lg:p-6 rounded-xl shadow-soft">
          {isLoading ? (
            <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-subtle-light dark:text-subtle-dark">
              Loading users...
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-red-500 mb-2">Error loading users: {error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-subtle-light dark:text-subtle-dark">
              No users available. Create your first user to get started.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle sm:px-0">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-border-light dark:border-border-dark">
                      <tr>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark">NAME</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark hidden sm:table-cell">EMAIL</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark">ROLE</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark hidden md:table-cell">LAST ACTIVE</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark hidden lg:table-cell">HOSPITAL</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 sm:px-4 lg:p-8 py-8 text-center text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                            No users match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                          >
                            <td className="px-3 sm:px-4 lg:p-4 py-3">
                              <div className="min-w-0">
                                <div className="text-sm sm:text-base font-medium text-foreground-light dark:text-foreground-dark truncate">{user.name}</div>
                                {/* Mobile: Show email below name */}
                                <div className="sm:hidden mt-1 text-xs text-subtle-light dark:text-subtle-dark truncate">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm text-foreground-light dark:text-foreground-dark hidden sm:table-cell">{user.email}</td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3">
                              <span
                                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                  user.role === 'Super Admin'
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark'
                                }`}
                              >
                                {user.role}
                              </span>
                              {/* Mobile: Show last active and hospital below role */}
                              <div className="md:hidden mt-2 space-y-1">
                                <div className="text-xs text-subtle-light dark:text-subtle-dark">
                                  <span className="font-medium">Last Active:</span> {formatLastActive(user.lastActive)}
                                </div>
                                <div className="text-xs text-subtle-light dark:text-subtle-dark">
                                  <span className="font-medium">Hospital:</span> {user.hospital || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm text-foreground-light dark:text-foreground-dark hidden md:table-cell">{formatLastActive(user.lastActive)}</td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm text-foreground-light dark:text-foreground-dark hidden lg:table-cell">{user.hospital || 'N/A'}</td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium touch-manipulation"
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                    Showing {startIndex} to {endIndex} of {totalResults} entries
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      aria-label="Previous page"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
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
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-colors touch-manipulation ${
                            page === pageNum
                              ? 'bg-primary text-white'
                              : 'text-foreground-light dark:text-foreground-dark hover:bg-subtle-light dark:hover:bg-subtle-dark'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      aria-label="Next page"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
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

