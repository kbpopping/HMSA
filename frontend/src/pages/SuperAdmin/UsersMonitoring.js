import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ProfilePicture from '../../components/ProfilePicture';
// Mock data for monitoring
const mockUserActivity = [
    { time: '00:00', logins: 12, active: 8 },
    { time: '04:00', logins: 8, active: 5 },
    { time: '08:00', logins: 45, active: 42 },
    { time: '12:00', logins: 38, active: 35 },
    { time: '16:00', logins: 52, active: 48 },
    { time: '20:00', logins: 28, active: 25 },
];
const mockRoleDistribution = [
    { role: 'Hospital Admin', count: 23, color: '#607AFB' },
    { role: 'Clinician', count: 156, color: '#10b981' },
    { role: 'Receptionist', count: 89, color: '#f59e0b' },
    { role: 'Super Admin', count: 1, color: '#ef4444' },
];
const mockRecentActivity = [
    {
        id: 1,
        user: 'Dr. Amelia Harper',
        action: 'Logged in',
        timestamp: '2 minutes ago',
        type: 'login'
    },
    {
        id: 2,
        user: 'Dr. Benjamin Carter',
        action: 'Created new appointment',
        timestamp: '5 minutes ago',
        type: 'action'
    },
    {
        id: 3,
        user: 'Dr. Chloe Bennett',
        action: 'Updated patient record',
        timestamp: '8 minutes ago',
        type: 'action'
    },
    {
        id: 4,
        user: 'Dr. Daniel Evans',
        action: 'Logged out',
        timestamp: '12 minutes ago',
        type: 'logout'
    },
    {
        id: 5,
        user: 'Dr. Eleanor Foster',
        action: 'Generated report',
        timestamp: '15 minutes ago',
        type: 'action'
    },
];
const UsersMonitoring = () => {
    const navigate = useNavigate();
    const [showUsersDropdown, setShowUsersDropdown] = useState(true);
    const getActivityIcon = (type) => {
        switch (type) {
            case 'login':
                return 'login';
            case 'logout':
                return 'logout';
            default:
                return 'edit';
        }
    };
    const getActivityColor = (type) => {
        switch (type) {
            case 'login':
                return 'text-green-600';
            case 'logout':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };
    return (_jsxs("div", { className: "flex min-h-screen bg-gray-50", children: [_jsxs("aside", { className: "w-64 bg-white flex flex-col p-4 border-r border-[#607AFB]/20 shadow-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 bg-[#607AFB]/20 rounded-full flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-[#607AFB] text-sm", children: "shield_person" }) }), _jsx("h1", { className: "text-xl font-bold text-gray-800", children: "HMSA" })] }), _jsx("button", { className: "text-gray-800", children: _jsx("span", { className: "material-symbols-outlined", children: "menu" }) })] }), _jsxs("nav", { className: "flex-grow space-y-2", children: [_jsxs(Link, { to: "/super/dashboard", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "dashboard" }), _jsx("span", { children: "Dashboard" })] }), _jsxs(Link, { to: "/super/hospitals", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "apartment" }), _jsx("span", { children: "Hospitals" })] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShowUsersDropdown(!showUsersDropdown), className: "flex items-center gap-3 px-4 py-2 rounded-lg bg-[#607AFB] text-white shadow-md w-full justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "material-symbols-outlined", children: "group" }), _jsx("span", { className: "font-semibold", children: "Users" })] }), _jsx("span", { className: `material-symbols-outlined transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`, children: "expand_more" })] }), showUsersDropdown && (_jsxs("div", { className: "mt-2 ml-4 space-y-2", children: [_jsxs(Link, { to: "/super/users", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "person" }), _jsx("span", { children: "Users" })] }), _jsxs(Link, { to: "/super/users/roles", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "verified_user" }), _jsx("span", { children: "Roles" })] }), _jsxs(Link, { to: "/super/users/monitoring", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded bg-[#607AFB]/10 text-[#607AFB] font-bold", children: [_jsx("span", { className: "material-symbols-outlined", children: "monitoring" }), _jsx("span", { children: "Monitoring" })] })] }))] }), _jsxs(Link, { to: "/super/settings", className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors", children: [_jsx("span", { className: "material-symbols-outlined", children: "settings" }), _jsx("span", { children: "Settings" })] })] }), _jsx("div", { className: "mt-auto", children: _jsxs("div", { className: "border-t border-[#607AFB]/20 pt-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(ProfilePicture, { size: "md", editable: false }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "Super Admin" }), _jsx("p", { className: "text-sm text-gray-500", children: "admin@hmsa.com" })] })] }), _jsxs("button", { onClick: () => navigate('/login'), className: "flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors w-full", children: [_jsx("span", { className: "material-symbols-outlined", children: "logout" }), _jsx("span", { children: "Logout" })] })] }) })] }), _jsx("main", { className: "flex-1 p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-800 mb-2", children: "User Monitoring" }), _jsx("p", { className: "text-gray-600", children: "Monitor user activity and system usage" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [_jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Users" }), _jsx("p", { className: "text-2xl font-bold text-gray-800", children: "269" })] }), _jsx("div", { className: "w-12 h-12 bg-[#607AFB]/10 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-[#607AFB]", children: "group" }) })] }) }), _jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Active Now" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: "42" })] }), _jsx("div", { className: "w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-green-600", children: "online_prediction" }) })] }) }), _jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Logins Today" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: "183" })] }), _jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-blue-600", children: "login" }) })] }) }), _jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Avg. Session" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: "2.4h" })] }), _jsx("div", { className: "w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-purple-600", children: "schedule" }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "User Activity (24h)" }), _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: mockUserActivity, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }), _jsx(XAxis, { dataKey: "time", stroke: "#666", fontSize: 12 }), _jsx(YAxis, { stroke: "#666", fontSize: 12 }), _jsx(Tooltip, { contentStyle: {
                                                                backgroundColor: '#fff',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                            } }), _jsx(Line, { type: "monotone", dataKey: "logins", stroke: "#607AFB", strokeWidth: 3, dot: { fill: '#607AFB', strokeWidth: 2, r: 4 }, name: "Logins" }), _jsx(Line, { type: "monotone", dataKey: "active", stroke: "#10b981", strokeWidth: 3, dot: { fill: '#10b981', strokeWidth: 2, r: 4 }, name: "Active Users" })] }) }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Role Distribution" }), _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: mockRoleDistribution, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }), _jsx(XAxis, { dataKey: "role", stroke: "#666", fontSize: 12 }), _jsx(YAxis, { stroke: "#666", fontSize: 12 }), _jsx(Tooltip, { contentStyle: {
                                                                backgroundColor: '#fff',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                            } }), _jsx(Bar, { dataKey: "count", fill: "#607AFB", radius: [4, 4, 0, 0] })] }) }) })] })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-sm", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-bold text-gray-800", children: "Recent Activity" }) }), _jsx("div", { className: "p-6", children: _jsx("div", { className: "space-y-4", children: mockRecentActivity.map((activity) => (_jsxs("div", { className: "flex items-center gap-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} bg-opacity-10`, children: _jsx("span", { className: "material-symbols-outlined text-sm", children: getActivityIcon(activity.type) }) }), _jsxs("div", { className: "flex-grow", children: [_jsx("p", { className: "font-medium text-gray-800", children: activity.user }), _jsx("p", { className: "text-sm text-gray-600", children: activity.action })] }), _jsx("div", { className: "text-sm text-gray-500", children: activity.timestamp })] }, activity.id))) }) })] })] }) })] }));
};
export default UsersMonitoring;
