import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AppShell from '../../components/layout/AppShell';
import { SuperAPI, Hospital } from '../../api/endpoints';
import CreateHospitalModal from './CreateHospitalModal';
import HospitalDetailModal from './HospitalDetailModal';
import DeleteHospitalModal from './DeleteHospitalModal';
import EditHospitalModal from './EditHospitalModal';
import { useNotifications } from '../../store/notifications';

// PRODUCTION: This type should come from endpoints.ts
type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Hospital Admin';
  lastActive: string;
  hospital: string | null;
  hospital_id?: string | null;
};

const Hospitals = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [timezoneFilter, setTimezoneFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [impersonatingHospital, setImpersonatingHospital] = useState<Hospital | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);
  const [hospitalToEdit, setHospitalToEdit] = useState<Hospital | null>(null);

  const limit = 10;

  // Fetch hospitals - using mock API
  const { data: hospitals = [], isLoading, error } = useQuery({
    queryKey: ['super', 'hospitals'],
    queryFn: async () => {
      try {
        const result = await SuperAPI.listHospitals();
        // Ensure we always return an array
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch users to count admins per hospital
  const { data: users = [] } = useQuery<User[]>({
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

  // Count admins per hospital
  const getAdminCount = (hospitalId: string) => {
    return users.filter(u => u.hospital_id === hospitalId && u.role === 'Hospital Admin').length;
  };

  // Impersonation mutation
  const impersonateMutation = useMutation({
    mutationFn: (hospitalId: string) => SuperAPI.impersonate(hospitalId),
    onSuccess: (data, hospitalId) => {
      const hospital = hospitals.find(h => h.id === hospitalId);
      if (hospital) {
        setImpersonatingHospital(hospital);
        toast.success(`Impersonating ${hospital.name}`);
        // PRODUCTION: This redirect happens after backend sets impersonation cookies
        // MOCK MODE: Direct redirect to hospital dashboard
        setTimeout(() => {
          navigate('/hospital/dashboard');
        }, 500);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to impersonate hospital');
    },
  });

  const { addNotification } = useNotifications();

  // Delete hospital mutation
  const deleteMutation = useMutation({
    mutationFn: (hospitalId: string) => SuperAPI.deleteHospital(hospitalId),
    onSuccess: (_, hospitalId) => {
      const hospital = hospitals.find(h => h.id === hospitalId);
      queryClient.invalidateQueries({ queryKey: ['super', 'hospitals'] });
      setHospitalToDelete(null);
      toast.success('Hospital deleted successfully');
      
      // Add notification
      if (hospital) {
        addNotification({
          type: 'hospital_deleted',
          title: 'Hospital Deleted',
          message: `Hospital "${hospital.name}" has been deleted from the system.`,
          route: '/super/hospitals',
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete hospital');
    },
  });

  // Filter hospitals - ensure hospitals is always an array
  const filteredHospitals = useMemo(() => {
    if (!hospitals || !Array.isArray(hospitals) || hospitals.length === 0) return [];
    return hospitals.filter(hospital => {
      const matchesSearch = !searchQuery || 
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = !countryFilter || hospital.country === countryFilter;
      const matchesTimezone = !timezoneFilter || hospital.timezone === timezoneFilter;
      
      return matchesSearch && matchesCountry && matchesTimezone;
    });
  }, [hospitals, searchQuery, countryFilter, timezoneFilter]);

  // Get unique countries and timezones for filters
  const countries = useMemo(() => {
    if (!hospitals || !Array.isArray(hospitals) || hospitals.length === 0) return [];
    const uniqueCountries = Array.from(new Set(hospitals.map(h => h.country).filter(Boolean))) as string[];
    return uniqueCountries.sort();
  }, [hospitals]);

  const timezones = useMemo(() => {
    if (!hospitals || !Array.isArray(hospitals) || hospitals.length === 0) return [];
    const uniqueTimezones = Array.from(new Set(hospitals.map(h => h.timezone)));
    return uniqueTimezones.sort();
  }, [hospitals]);

  // Pagination
  const offset = (page - 1) * limit;
  const totalPages = Math.max(1, Math.ceil(filteredHospitals.length / limit));
  const paginatedHospitals = filteredHospitals.slice(offset, offset + limit);
  const startIndex = filteredHospitals.length > 0 ? offset + 1 : 0;
  const endIndex = Math.min(offset + limit, filteredHospitals.length);
  const totalResults = filteredHospitals.length;

  const handleCreateSuccess = (hospitalName?: string) => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['super', 'hospitals'] });
    toast.success('Hospital created successfully!');
    
    // Add notification
    if (hospitalName) {
      addNotification({
        type: 'hospital_added',
        title: 'New Hospital Added',
        message: `Hospital "${hospitalName}" has been added to the system.`,
        route: '/super/hospitals',
      });
      
      // Also notify about hospital admin creation
      addNotification({
        type: 'hospital_admin_added',
        title: 'Hospital Admin Created',
        message: `A new hospital admin account has been created for "${hospitalName}".`,
        route: '/super/users',
      });
    }
  };

  const handleImpersonate = (e: React.MouseEvent, hospitalId: string) => {
    e.stopPropagation(); // Prevent row click
    impersonateMutation.mutate(hospitalId);
  };

  const handleExitImpersonation = () => {
    // PRODUCTION: Call API to exit impersonation mode
    // MOCK MODE: Just navigate back
    setImpersonatingHospital(null);
    navigate('/super/hospitals');
    toast.info('Exited impersonation mode');
  };

  const handleRowClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
  };

  const handleEdit = (e: React.MouseEvent, hospital: Hospital) => {
    e.stopPropagation(); // Prevent row click
    setHospitalToEdit(hospital);
  };

  const handleDelete = (e: React.MouseEvent, hospital: Hospital) => {
    e.stopPropagation(); // Prevent row click
    setHospitalToDelete(hospital);
  };

  const handleDeleteConfirm = () => {
    if (hospitalToDelete) {
      deleteMutation.mutate(hospitalToDelete.id);
    }
  };

  const handleEditSuccess = () => {
    setHospitalToEdit(null);
    queryClient.invalidateQueries({ queryKey: ['super', 'hospitals'] });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AppShell role="super_admin">
      <div className="max-w-7xl mx-auto">
        {/* Impersonation Banner */}
        {impersonatingHospital && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg mb-6 flex justify-between items-center shadow-soft">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">swap_horiz</span>
              <p>
                <span className="font-bold">Impersonating '{impersonatingHospital.name}'.</span> Your actions are being logged.
              </p>
            </div>
            <button
              onClick={handleExitImpersonation}
              className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 font-bold py-1 px-2 rounded-md transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Header */}
        <header className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                Hospitals Management
              </h2>
              <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mt-1">
                Manage all hospitals in the system.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto bg-primary text-white px-4 sm:px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-soft text-sm sm:text-base touch-manipulation"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">add_business</span>
              Create Hospital
            </button>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-lg sm:text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Search by hospital name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark text-sm sm:text-base"
              />
            </div>
            <div>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark text-sm sm:text-base"
              >
                <option value="">Filter by Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={timezoneFilter}
                onChange={(e) => setTimezoneFilter(e.target.value)}
                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark text-sm sm:text-base"
              >
                <option value="">Filter by Timezone</option>
                {timezones.map(timezone => (
                  <option key={timezone} value={timezone}>{timezone}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card-light dark:bg-card-dark p-3 sm:p-4 lg:p-6 rounded-xl shadow-soft">
          {isLoading ? (
            <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-subtle-light dark:text-subtle-dark">
              Loading hospitals...
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-red-500 mb-2">Error loading hospitals: {error instanceof Error ? error.message : 'Unknown error'}</p>
              <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">Please check the console for details.</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-subtle-light dark:text-subtle-dark">
              No hospitals available. Create your first hospital to get started.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle sm:px-0">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-border-light dark:border-border-dark">
                      <tr>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark">Name</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark hidden md:table-cell">Country</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark hidden lg:table-cell">Timezone</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark hidden lg:table-cell">Created At</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark hidden sm:table-cell">Admins</th>
                        <th className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm font-bold text-right text-foreground-light dark:text-foreground-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHospitals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 sm:px-4 lg:p-8 py-8 text-center text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                            No hospitals match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedHospitals.map((hospital) => (
                          <tr
                            key={hospital.id}
                            onClick={() => handleRowClick(hospital)}
                            className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors cursor-pointer"
                          >
                            <td className="px-3 sm:px-4 lg:p-4 py-3">
                              <div className="min-w-0">
                                <div className="text-sm sm:text-base font-medium text-foreground-light dark:text-foreground-dark truncate">{hospital.name}</div>
                                {/* Mobile: Show additional info */}
                                <div className="md:hidden mt-1 space-y-1">
                                  <div className="text-xs text-subtle-light dark:text-subtle-dark">
                                    <span className="font-medium">Country:</span> {hospital.country || '-'}
                                  </div>
                                  <div className="text-xs text-subtle-light dark:text-subtle-dark">
                                    <span className="font-medium">Admins:</span> {getAdminCount(hospital.id)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm text-foreground-light dark:text-foreground-dark hidden md:table-cell">{hospital.country || '-'}</td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm text-foreground-light dark:text-foreground-dark hidden lg:table-cell">{hospital.timezone}</td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm text-foreground-light dark:text-foreground-dark hidden lg:table-cell">{formatDate(hospital.created_at)}</td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3 text-xs sm:text-sm text-foreground-light dark:text-foreground-dark hidden sm:table-cell">
                              <span>{getAdminCount(hospital.id)}</span>
                            </td>
                            <td className="px-3 sm:px-4 lg:p-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <button
                                  onClick={(e) => handleImpersonate(e, hospital.id)}
                                  className="text-primary hover:text-primary/80 transition-colors p-1.5 sm:p-2 rounded-full touch-manipulation"
                                  title="Impersonate"
                                  aria-label="Impersonate"
                                >
                                  <span className="material-symbols-outlined text-lg sm:text-xl">swap_horiz</span>
                                </button>
                                <button
                                  onClick={(e) => handleEdit(e, hospital)}
                                  className="text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors p-1.5 sm:p-2 rounded-full touch-manipulation"
                                  title="Edit"
                                  aria-label="Edit"
                                >
                                  <span className="material-symbols-outlined text-lg sm:text-xl">edit</span>
                                </button>
                                <button
                                  onClick={(e) => handleDelete(e, hospital)}
                                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1.5 sm:p-2 rounded-full touch-manipulation"
                                  title="Delete"
                                  aria-label="Delete"
                                >
                                  <span className="material-symbols-outlined text-lg sm:text-xl">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalResults > 0 && (
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <span className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                    Showing {startIndex} to {endIndex} of {totalResults} results
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      aria-label="Previous page"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
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
                    {totalPages > 5 && <span className="px-1 sm:px-2 text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">...</span>}
                    {totalPages > 5 && (
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-colors touch-manipulation ${
                          page === totalPages
                            ? 'bg-primary text-white'
                            : 'text-foreground-light dark:text-foreground-dark hover:bg-subtle-light dark:hover:bg-subtle-dark'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}
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

      {/* Create Hospital Modal */}
      {isCreateModalOpen && (
        <CreateHospitalModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}

      {/* Edit Hospital Modal */}
      {hospitalToEdit && (
        <EditHospitalModal
          hospital={hospitalToEdit}
          onClose={() => setHospitalToEdit(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Hospital Modal */}
      {hospitalToDelete && (
        <DeleteHospitalModal
          hospital={hospitalToDelete}
          onClose={() => setHospitalToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </AppShell>
  );
};

export default Hospitals;
