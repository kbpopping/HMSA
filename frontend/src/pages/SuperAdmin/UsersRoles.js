import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const filteredRoles = mockRoles.filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase()));
    // Pagination
    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRoles = filteredRoles.slice(startIndex, endIndex);
    const handleEdit = (roleId, roleName) => {
        alert(`Edit role: ${roleName} (ID: ${roleId})`);
    };
    const handleAddNewRole = () => {
        alert('Add New Role functionality would be implemented here');
    };
    return (_jsxs("div", { className: "flex min-h-screen bg-gray-50", children: [_jsxs("aside", { className: "w-64 bg-white flex flex-col p-4 border-r border-[#607AFB]/20 shadow-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 bg-[#607AFB]/20 rounded-full flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-[#607AFB] text-sm", children: "shield_person" }) }), _jsx("h1", { className: "text-xl font-bold text-gray-800", children: "HMSA" })] }), _jsx("button", { className: "text-gray-800", children: _jsx("span", { className: "material-symbols-outlined", children: "menu" }) })] }), _jsxs("nav", { className: "flex-grow space-y-2", children: [_jsxs(Link, { to: "/super/dashboard", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "dashboard" }), _jsx("span", { children: "Dashboard" })] }), _jsxs(Link, { to: "/super/hospitals", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "apartment" }), _jsx("span", { children: "Hospitals" })] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShowUsersDropdown(!showUsersDropdown), className: "flex items-center gap-3 px-4 py-2 rounded-lg bg-[#607AFB] text-white shadow-md w-full justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "material-symbols-outlined", children: "group" }), _jsx("span", { className: "font-semibold", children: "Users" })] }), _jsx("span", { className: `material-symbols-outlined transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`, children: "expand_more" })] }), showUsersDropdown && (_jsxs("div", { className: "mt-2 ml-4 space-y-2", children: [_jsxs(Link, { to: "/super/users", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "person" }), _jsx("span", { children: "Users" })] }), _jsxs(Link, { to: "/super/users/roles", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded bg-[#607AFB]/10 text-[#607AFB] font-bold", children: [_jsx("span", { className: "material-symbols-outlined", children: "verified_user" }), _jsx("span", { children: "Roles" })] }), _jsxs(Link, { to: "/super/users/monitoring", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "monitoring" }), _jsx("span", { children: "Monitoring" })] })] }))] }), _jsxs(Link, { to: "/super/settings", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "settings" }), _jsx("span", { children: "Settings" })] })] }), _jsx("div", { className: "mt-auto", children: _jsxs("div", { className: "border-t border-[#607AFB]/20 pt-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(ProfilePicture, { size: "md", editable: false }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "Super Admin" }), _jsx("p", { className: "text-sm text-gray-500", children: "admin@hmsa.com" })] })] }), _jsxs("button", { onClick: () => navigate('/login'), className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors w-full", children: [_jsx("span", { className: "material-symbols-outlined", children: "logout" }), _jsx("span", { children: "Logout" })] })] }) })] }), _jsx("main", { className: "flex-1 p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-800", children: "Roles" }), _jsx("button", { onClick: handleAddNewRole, className: "bg-[#607AFB] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-[#607AFB]/90 transition-colors", children: "Add New Role" })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400", children: _jsx("span", { className: "material-symbols-outlined", children: "search" }) }), _jsx("input", { className: "w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#607AFB] focus:border-transparent transition", placeholder: "Search roles by name or description...", type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: currentRoles.map((role) => (_jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-gray-800", children: role.name }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: role.description })] }), _jsx("button", { onClick: () => handleEdit(role.id, role.name), className: "text-[#607AFB] hover:text-[#607AFB]/80 transition-colors", children: _jsx("span", { className: "material-symbols-outlined", children: "edit" }) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Permissions:" }), _jsx("div", { className: "space-y-1", children: role.permissions.map((permission, index) => (_jsx("span", { className: "inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mr-2 mb-1", children: permission }, index))) })] }), _jsxs("div", { className: "flex justify-between items-center text-sm text-gray-500", children: [_jsxs("span", { children: [role.userCount, " users"] }), _jsxs("span", { children: ["Created: ", role.createdAt] })] })] }, role.id))) }), totalPages > 1 && (_jsx("div", { className: "flex justify-center items-center mt-8", children: _jsxs("nav", { className: "flex items-center space-x-1", children: [_jsx("button", { className: "px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50", disabled: currentPage === 1, onClick: () => setCurrentPage(currentPage - 1), children: _jsx("span", { className: "material-symbols-outlined", children: "chevron_left" }) }), Array.from({ length: totalPages }, (_, i) => (_jsx("button", { className: `px-4 py-2 rounded-lg font-bold ${currentPage === i + 1
                                            ? 'bg-[#607AFB] text-white'
                                            : 'text-gray-500 hover:bg-gray-200'}`, onClick: () => setCurrentPage(i + 1), children: i + 1 }, i + 1))), _jsx("button", { className: "px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50", disabled: currentPage === totalPages, onClick: () => setCurrentPage(currentPage + 1), children: _jsx("span", { className: "material-symbols-outlined", children: "chevron_right" }) })] }) }))] }) })] }));
};
export default UsersRoles;
