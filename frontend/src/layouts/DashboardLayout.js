import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Calendar, Users, FileText, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';
const DashboardLayout = ({ role }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isSuperAdmin = role === 'super-admin';
    const navigation = isSuperAdmin
        ? [
            { name: 'Dashboard', href: '/super/dashboard', icon: LayoutDashboard },
            { name: 'Hospitals', href: '/super/hospitals', icon: Building2 },
            { name: 'Settings', href: '/super/settings', icon: Settings },
        ]
        : [
            { name: 'Dashboard', href: '/hospital/dashboard', icon: LayoutDashboard },
            { name: 'Appointments', href: '/hospital/appointments', icon: Calendar },
            { name: 'Patients', href: '/hospital/patients', icon: Users },
            { name: 'Clinicians', href: '/hospital/clinicians', icon: Users },
            { name: 'Templates', href: '/hospital/templates', icon: FileText },
            { name: 'Messages', href: '/hospital/messages', icon: MessageSquare },
            { name: 'Settings', href: '/hospital/settings', icon: Settings },
        ];
    const handleLogout = () => {
        // In a real app, you would clear auth tokens/cookies here
        navigate('/login');
    };
    return (_jsxs("div", { className: "dashboard-container", children: [_jsxs("div", { className: `md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`, children: [_jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-75", onClick: () => setSidebarOpen(false) }), _jsxs("div", { className: "fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-primary-800", children: [_jsxs("div", { className: "flex items-center justify-between h-16 px-4 bg-primary-900", children: [_jsx("div", { className: "text-xl font-bold text-white", children: "HMSA" }), _jsx("button", { onClick: () => setSidebarOpen(false), className: "text-white", children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsx("nav", { className: "px-2 py-4 space-y-1", children: navigation.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (_jsxs(Link, { to: item.href, className: `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                                                ? 'bg-primary-900 text-white'
                                                : 'text-white hover:bg-primary-700'}`, children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name));
                                    }) }) })] })] }), _jsxs("div", { className: "sidebar hidden md:block", children: [_jsx("div", { className: "flex items-center justify-between h-16 px-4 bg-primary-900", children: _jsx("div", { className: "text-xl font-bold text-white", children: "HMSA" }) }), _jsx("nav", { className: "px-2 py-4 space-y-1", children: navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (_jsxs(Link, { to: item.href, className: `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                                    ? 'bg-primary-900 text-white'
                                    : 'text-white hover:bg-primary-700'}`, children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name));
                        }) })] }), _jsxs("div", { className: "main-content flex-1 overflow-auto", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "flex items-center justify-between px-4 py-4 sm:px-6", children: [_jsx("button", { onClick: () => setSidebarOpen(true), className: "md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500", children: _jsx(Menu, { size: 24 }) }), _jsx("div", { className: "flex-1 md:ml-4", children: _jsx("h1", { className: "text-xl font-semibold text-gray-900", children: navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard' }) }), _jsx("div", { children: _jsxs("button", { onClick: handleLogout, className: "flex items-center text-sm font-medium text-gray-500 hover:text-gray-700", children: [_jsx(LogOut, { className: "mr-2 h-5 w-5" }), "Logout"] }) })] }) }), _jsx("main", { className: "p-4 sm:p-6", children: _jsx(Outlet, {}) })] })] }));
};
export default DashboardLayout;
