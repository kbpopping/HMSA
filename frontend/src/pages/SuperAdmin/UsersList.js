import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    const filteredUsers = mockUsers.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.hospital.toLowerCase().includes(searchTerm.toLowerCase()));
    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    const handleEdit = (userId, userName) => {
        alert(`Edit user: ${userName} (ID: ${userId})`);
    };
    const handleAddNewUser = () => {
        alert('Add New User functionality would be implemented here');
    };
    const getRoleBadgeStyle = (role) => {
        if (role === 'Super Admin') {
            return 'px-3 py-1 text-xs font-medium rounded-full bg-[#607AFB]/20 text-[#607AFB]';
        }
        return 'px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600';
    };
    return (_jsxs("div", { className: "flex min-h-screen bg-gray-50", children: [_jsxs("aside", { className: "w-64 bg-white flex flex-col p-4 border-r border-[#607AFB]/20 shadow-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 bg-[#607AFB]/20 rounded-full flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-[#607AFB] text-sm", children: "shield_person" }) }), _jsx("h1", { className: "text-xl font-bold text-gray-800", children: "HMSA" })] }), _jsx("button", { className: "text-gray-800", children: _jsx("span", { className: "material-symbols-outlined", children: "menu" }) })] }), _jsxs("nav", { className: "flex-grow space-y-2", children: [_jsxs(Link, { to: "/super/dashboard", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "dashboard" }), _jsx("span", { children: "Dashboard" })] }), _jsxs(Link, { to: "/super/hospitals", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "apartment" }), _jsx("span", { children: "Hospitals" })] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShowUsersDropdown(!showUsersDropdown), className: "flex items-center gap-3 px-4 py-2 rounded-lg bg-[#607AFB] text-white shadow-md w-full justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "material-symbols-outlined", children: "group" }), _jsx("span", { className: "font-semibold", children: "Users" })] }), _jsx("span", { className: `material-symbols-outlined transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`, children: "expand_more" })] }), showUsersDropdown && (_jsxs("div", { className: "mt-2 ml-4 space-y-2", children: [_jsxs(Link, { to: "/super/users/roles", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "verified_user" }), _jsx("span", { children: "Roles" })] }), _jsxs(Link, { to: "/super/users/monitoring", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "monitoring" }), _jsx("span", { children: "Monitoring" })] })] }))] }), _jsxs(Link, { to: "/super/settings", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "settings" }), _jsx("span", { children: "Settings" })] })] }), _jsx("div", { className: "mt-auto", children: _jsxs("div", { className: "border-t border-[#607AFB]/20 pt-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(ProfilePicture, { size: "md", editable: false }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "Super Admin" }), _jsx("p", { className: "text-sm text-gray-500", children: "admin@hmsa.com" })] })] }), _jsxs("button", { onClick: () => navigate('/login'), className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors w-full", children: [_jsx("span", { className: "material-symbols-outlined", children: "logout" }), _jsx("span", { children: "Logout" })] })] }) })] }), _jsx("main", { className: "flex-1 p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-800", children: "Users" }), _jsx("button", { onClick: handleAddNewUser, className: "bg-[#607AFB] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-[#607AFB]/90 transition-colors", children: "Add New User" })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400", children: _jsx("span", { className: "material-symbols-outlined", children: "search" }) }), _jsx("input", { className: "w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#607AFB] focus:border-transparent transition", placeholder: "Search users by name, email or role...", type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }) }), _jsx("div", { className: "bg-white rounded-xl shadow-sm overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm text-left text-gray-500", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 font-semibold", scope: "col", children: "Name" }), _jsx("th", { className: "px-6 py-4 font-semibold", scope: "col", children: "Email" }), _jsx("th", { className: "px-6 py-4 font-semibold", scope: "col", children: "Role" }), _jsx("th", { className: "px-6 py-4 font-semibold", scope: "col", children: "Last Active" }), _jsx("th", { className: "px-6 py-4 font-semibold", scope: "col", children: "Hospital" }), _jsx("th", { className: "px-6 py-4 font-semibold", scope: "col", children: _jsx("span", { className: "sr-only", children: "Actions" }) })] }) }), _jsx("tbody", { children: currentUsers.map((user) => (_jsxs("tr", { className: "bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-6 py-4 font-medium text-gray-900 whitespace-nowrap", children: user.name }), _jsx("td", { className: "px-6 py-4", children: user.email }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: getRoleBadgeStyle(user.role), children: user.role }) }), _jsx("td", { className: "px-6 py-4", children: user.lastActive }), _jsx("td", { className: "px-6 py-4", children: user.hospital }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsx("button", { onClick: () => handleEdit(user.id, user.name), className: "text-[#607AFB] hover:text-[#607AFB]/80 transition-colors", children: "Edit" }) })] }, user.id))) })] }) }) }), _jsxs("div", { className: "flex justify-between items-center mt-6", children: [_jsxs("span", { className: "text-sm text-gray-500", children: ["Showing ", startIndex + 1, " to ", Math.min(endIndex, filteredUsers.length), " of ", filteredUsers.length, " entries"] }), _jsxs("nav", { className: "flex items-center space-x-1", children: [_jsx("button", { className: "px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50", disabled: currentPage === 1, onClick: () => setCurrentPage(currentPage - 1), children: _jsx("span", { className: "material-symbols-outlined", children: "chevron_left" }) }), Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const page = i + 1;
                                            return (_jsx("button", { className: `px-4 py-2 rounded-lg font-bold ${currentPage === page
                                                    ? 'bg-[#607AFB] text-white'
                                                    : 'text-gray-500 hover:bg-gray-200'}`, onClick: () => setCurrentPage(page), children: page }, page));
                                        }), totalPages > 5 && (_jsxs(_Fragment, { children: [_jsx("span", { className: "px-4 py-2 text-gray-500", children: "..." }), _jsx("button", { className: "px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors", onClick: () => setCurrentPage(totalPages), children: totalPages })] })), _jsx("button", { className: "px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50", disabled: currentPage === totalPages, onClick: () => setCurrentPage(currentPage + 1), children: _jsx("span", { className: "material-symbols-outlined", children: "chevron_right" }) })] })] })] }) })] }));
};
export default UsersList;
