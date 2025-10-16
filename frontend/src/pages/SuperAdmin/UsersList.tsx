import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePicture from '../../components/ProfilePicture';

// Mock data for users
const mockUsers = [
  { 
    id: 1, 
    name: 'Dr. Amelia Harper', 
    email: 'amelia.harper@example.com', 
    role: 'Super Admin', 
    lastActive: '2 days ago', 
    hospital: 'N/A' 
  },
  { 
    id: 2, 
    name: 'Dr. Benjamin Carter', 
    email: 'benjamin.carter@example.com', 
    role: 'Hospital Admin', 
    lastActive: '1 day ago', 
    hospital: 'City General Hospital' 
  },
  { 
    id: 3, 
    name: 'Dr. Chloe Bennett', 
    email: 'chloe.bennett@example.com', 
    role: 'Hospital Admin', 
    lastActive: '3 days ago', 
    hospital: 'County Medical Center' 
  },
  { 
    id: 4, 
    name: 'Dr. Daniel Evans', 
    email: 'daniel.evans@example.com', 
    role: 'Hospital Admin', 
    lastActive: '1 week ago', 
    hospital: 'Regional Health System' 
  },
  { 
    id: 5, 
    name: 'Dr. Eleanor Foster', 
    email: 'eleanor.foster@example.com', 
    role: 'Hospital Admin', 
    lastActive: '2 days ago', 
    hospital: 'Community Wellness Clinic' 
  },
  { 
    id: 6, 
    name: 'Dr. Finnigan Graham', 
    email: 'finnigan.graham@example.com', 
    role: 'Hospital Admin', 
    lastActive: '1 day ago', 
    hospital: 'MetroCare Hospital' 
  },
  { 
    id: 7, 
    name: 'Dr. Gabriel Hughes', 
    email: 'gabriel.hughes@example.com', 
    role: 'Hospital Admin', 
    lastActive: '4 days ago', 
    hospital: 'St. Mary\'s Hospital' 
  },
  { 
    id: 8, 
    name: 'Dr. Isabella Jones', 
    email: 'isabella.jones@example.com', 
    role: 'Hospital Admin', 
    lastActive: '2 weeks ago', 
    hospital: 'Mercy Medical Center' 
  },
];

const UsersList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);

  const itemsPerPage = 6;

  // Filter users based on search
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleEdit = (userId: number, userName: string) => {
    alert(`Edit user: ${userName} (ID: ${userId})`);
  };

  const handleAddNewUser = () => {
    alert('Add New User functionality would be implemented here');
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'Super Admin') {
      return 'px-3 py-1 text-xs font-medium rounded-full bg-[#607AFB]/20 text-[#607AFB]';
    }
    return 'px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600';
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
                  to="/super/users/roles" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
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
            <h1 className="text-4xl font-bold text-gray-800">Users</h1>
            <button 
              onClick={handleAddNewUser}
              className="bg-[#607AFB] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-[#607AFB]/90 transition-colors"
            >
              Add New User
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
                placeholder="Search users by name, email or role..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold" scope="col">Name</th>
                    <th className="px-6 py-4 font-semibold" scope="col">Email</th>
                    <th className="px-6 py-4 font-semibold" scope="col">Role</th>
                    <th className="px-6 py-4 font-semibold" scope="col">Last Active</th>
                    <th className="px-6 py-4 font-semibold" scope="col">Hospital</th>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={getRoleBadgeStyle(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{user.lastActive}</td>
                      <td className="px-6 py-4">{user.hospital}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEdit(user.id, user.name)}
                          className="text-[#607AFB] hover:text-[#607AFB]/80 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} entries
            </span>
            <nav className="flex items-center space-x-1">
              <button 
                className="px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button 
                    key={page}
                    className={`px-4 py-2 rounded-lg font-bold ${
                      currentPage === page 
                        ? 'bg-[#607AFB] text-white' 
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-4 py-2 text-gray-500">...</span>
                  <button 
                    className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button 
                className="px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsersList;
