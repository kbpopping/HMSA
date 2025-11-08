import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AppShell from '../../components/layout/AppShell';
import { SuperAPI } from '../../api/endpoints';
import AddRoleModal from './AddRoleModal';
import EditRoleModal from './EditRoleModal';
import RoleDetailModal from './RoleDetailModal';

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  hospitals?: string[]; // List of hospital names using this role
};

const Roles = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const limit = 6;

  // Fetch roles - using mock API
  const { data: roles = [], isLoading, error } = useQuery<Role[]>({
    queryKey: ['super', 'roles'],
    queryFn: async () => {
      try {
        const result = await SuperAPI.listRoles();
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching roles:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch users to calculate actual user counts per role
  const { data: users = [] } = useQuery({
    queryKey: ['super', 'users'],
    queryFn: async () => {
      try {
        const result = await SuperAPI.listUsers();
        return Array.isArray(result) ? result : [];
      } catch (err) {
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch hospitals to show which hospitals use each role
  const { data: hospitals = [] } = useQuery({
    queryKey: ['super', 'hospitals'],
    queryFn: async () => {
      try {
        const result = await SuperAPI.listHospitals();
        return Array.isArray(result) ? result : [];
      } catch (err) {
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Enrich roles with actual user counts and hospitals
  const enrichedRoles = useMemo(() => {
    return roles.map(role => {
      // Direct match - role names should match user roles exactly
      const roleUsers = users.filter(u => u.role === role.name);
      const roleHospitals = Array.from(new Set(
        roleUsers
          .filter(u => u.hospital)
          .map(u => u.hospital!)
      ));

      return {
        ...role,
        userCount: roleUsers.length,
        hospitals: roleHospitals,
      };
    });
  }, [roles, users]);

  // Filter roles based on search
  const filteredRoles = useMemo(() => {
    if (!enrichedRoles || !Array.isArray(enrichedRoles) || enrichedRoles.length === 0) return [];
    const query = searchQuery.toLowerCase();
    return enrichedRoles.filter(role => 
      role.name.toLowerCase().includes(query) ||
      role.description.toLowerCase().includes(query) ||
      role.permissions.some(p => p.toLowerCase().includes(query))
    );
  }, [enrichedRoles, searchQuery]);

  // Pagination
  const offset = (page - 1) * limit;
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / limit));
  const paginatedRoles = filteredRoles.slice(offset, offset + limit);
  const startIndex = filteredRoles.length > 0 ? offset + 1 : 0;
  const endIndex = Math.min(offset + limit, filteredRoles.length);
  const totalResults = filteredRoles.length;

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['super', 'roles'] });
    toast.success('Role created successfully!');
  };

  const handleEditSuccess = () => {
    setRoleToEdit(null);
    queryClient.invalidateQueries({ queryKey: ['super', 'roles'] });
    toast.success('Role updated successfully!');
  };

  const handleEdit = (e: React.MouseEvent, role: Role) => {
    e.stopPropagation(); // Prevent card click
    setRoleToEdit(role);
  };

  const handleCardClick = (role: Role) => {
    setSelectedRole(role);
  };

  return (
    <AppShell role="super_admin">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">
              Roles
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-soft"
            >
              <span className="material-symbols-outlined">add</span>
              Add New Role
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
              search
            </span>
            <input
              type="text"
              placeholder="Search roles by name or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:border-primary focus:ring-primary focus:outline-none"
            />
          </div>
        </header>

        {/* Roles Cards */}
        {isLoading ? (
          <div className="text-center py-12 text-subtle-light dark:text-subtle-dark">
            Loading roles...
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">Error loading roles: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 text-subtle-light dark:text-subtle-dark">
            No roles available. Create your first role to get started.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedRoles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleCardClick(role)}
                  className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6 cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border border-transparent hover:border-primary/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-1">
                        {role.name}
                      </h3>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        {role.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleEdit(e, role)}
                      className="text-primary hover:text-primary/80 transition-colors p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20"
                      title="Edit Role"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                      Permissions:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark rounded border border-border-light dark:border-border-dark"
                        >
                          {permission}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs text-subtle-light dark:text-subtle-dark">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-subtle-light dark:text-subtle-dark pt-4 border-t border-border-light dark:border-border-dark">
                    <span className="font-medium">{role.userCount} users</span>
                    <span>Created: {new Date(role.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
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

      {/* Add Role Modal */}
      {isAddModalOpen && (
        <AddRoleModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Edit Role Modal */}
      {roleToEdit && (
        <EditRoleModal
          role={roleToEdit}
          onClose={() => setRoleToEdit(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Role Detail Modal */}
      {selectedRole && (
        <RoleDetailModal
          role={selectedRole}
          users={users}
          hospitals={hospitals}
          onClose={() => setSelectedRole(null)}
          onEdit={() => {
            setSelectedRole(null);
            setRoleToEdit(selectedRole);
          }}
        />
      )}
    </AppShell>
  );
};

export default Roles;

