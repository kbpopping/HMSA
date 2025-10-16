import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePicture from '../../components/ProfilePicture';

// Mock data for roles
const mockRoles = [
  { 
    id: 1, 
    name: 'Super Admin', 
    description: 'Full system access and control', 
    permissions: ['All Permissions'],
    userCount: 1,
    createdAt: '2023-01-01'
  },
  { 
    id: 2, 
    name: 'Hospital Admin', 
    description: 'Manage hospital operations and users', 
    permissions: ['Hospital Management', 'User Management', 'Reports'],
    userCount: 23,
    createdAt: '2023-01-01'
  },
  { 
    id: 3, 
    name: 'Clinician', 
    description: 'Access patient data and appointments', 
    permissions: ['Patient Management', 'Appointments', 'Medical Records'],
    userCount: 156,
    createdAt: '2023-01-01'
  },
  { 
    id: 4, 
    name: 'Receptionist', 
    description: 'Manage appointments and patient check-ins', 
    permissions: ['Appointments', 'Patient Check-in', 'Basic Reports'],
    userCount: 89,
    createdAt: '2023-01-01'
  },
];

const UsersRoles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUsersDropdown, setShowUsersDropdown] = useState(true);

  const itemsPerPage = 4;

  // Filter roles based on search
  const filteredRoles = mockRoles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  const handleEdit = (roleId: number, roleName: string) => {
    alert(`Edit role: ${roleName} (ID: ${roleId})`);
  };

  const handleAddNewRole = () => {
    alert('Add New Role functionality would be implemented here');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col p-4 border-r border-[#607AFB]/20 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#607AFB]/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#607AFB] text-sm">shield_person</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">HMSA</h1>
          </div>
          <button className="text-gray-800">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        
        <nav className="flex-grow space-y-2">
          <Link 
            to="/super/dashboard" 
            className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/super/hospitals" 
            className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">apartment</span>
            <span>Hospitals</span>
          </Link>
          
          {/* Users with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUsersDropdown(!showUsersDropdown)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#607AFB] text-white shadow-md w-full justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">group</span>
                <span className="font-semibold">Users</span>
              </div>
              <span className={`material-symbols-outlined transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {/* Dropdown menu */}
            {showUsersDropdown && (
              <div className="mt-2 ml-4 space-y-2">
                <Link 
                  to="/super/users" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">person</span>
                  <span>Users</span>
                </Link>
                <Link 
                  to="/super/users/roles" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded bg-[#607AFB]/10 text-[#607AFB] font-bold"
                >
                  <span className="material-symbols-outlined">verified_user</span>
                  <span>Roles</span>
                </Link>
                <Link 
                  to="/super/users/monitoring" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">monitoring</span>
                  <span>Monitoring</span>
                </Link>
              </div>
            )}
          </div>
          
          <Link 
            to="/super/settings" 
            className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        
        <div className="mt-auto">
          <div className="border-t border-[#607AFB]/20 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <ProfilePicture
                size="md"
                editable={false}
              />
              <div>
                <p className="font-semibold text-gray-800">Super Admin</p>
                <p className="text-sm text-gray-500">admin@hmsa.com</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors w-full"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Roles</h1>
            <button 
              onClick={handleAddNewRole}
              className="bg-[#607AFB] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-[#607AFB]/90 transition-colors"
            >
              Add New Role
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#607AFB] focus:border-transparent transition" 
                placeholder="Search roles by name or description..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Roles Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRoles.map((role) => (
              <div key={role.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  </div>
                  <button 
                    onClick={() => handleEdit(role.id, role.name)}
                    className="text-[#607AFB] hover:text-[#607AFB]/80 transition-colors"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Permissions:</h4>
                  <div className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mr-2 mb-1"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{role.userCount} users</span>
                  <span>Created: {role.createdAt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8">
              <nav className="flex items-center space-x-1">
                <button 
                  className="px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i + 1}
                    className={`px-4 py-2 rounded-lg font-bold ${
                      currentPage === i + 1 
                        ? 'bg-[#607AFB] text-white' 
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UsersRoles;
