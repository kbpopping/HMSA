import { jsx as _jsx } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
const AuthLayout = () => {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx("div", { className: "w-full max-w-md", children: _jsx(Outlet, {}) }) }));
};
export default AuthLayout;
