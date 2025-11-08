import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
const LoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = async (data) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            if (data.email.includes('superadmin')) {
                navigate('/super-admin');
            }
            else if (data.email.includes('admin')) {
                navigate('/admin');
            }
            else {
                navigate('/user');
            }
        }, 1000);
    };
    return (_jsxs("div", { className: "relative min-h-screen w-full", children: [_jsxs("div", { className: "absolute inset-0 z-0", children: [_jsx("img", { alt: "Two smiling doctors", className: "h-full w-full object-cover", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNL1ZIyHw1sBCeTAp8ny32daCTNGBdpgdNutKLM3Gj_jmkiykE7LKdje0TK0OcBc8oSmt88Npws-DgdJP4g_7oiaT-rA4IezUjhJbE9wgh-87BhWld7LHK9C7BSqdv3xAeWN7jTqO3BJM-ARFf_dfBr2jKRGjb77jBAv4pUJyX6-b4aODFBWiERdVAnV0KGLm4wjnjvEkJQf1ceX_wiPZrUKxD3eL834FI-pn1AmVavGqcwMVGPDe2tSENrz6JpKKfOB7pudatOSs" }), _jsx("div", { className: "absolute inset-0 bg-black/50" })] }), _jsx("div", { className: "relative z-10 flex min-h-screen items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md space-y-6 rounded-xl bg-background-light/90 dark:bg-background-dark/90 p-8 shadow-soft backdrop-blur-sm", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "mb-6 flex justify-center items-center", children: [_jsx("div", { className: "bg-primary p-2 rounded-full inline-block", children: _jsx("svg", { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }) }) }), _jsx("span", { className: "ml-4 text-2xl font-bold font-inconsolata text-text-light dark:text-text-dark", children: "HMSA" })] }), _jsx("h1", { className: "text-3xl font-bold text-text-light dark:text-text-dark", children: "Welcome Back" }), _jsx("p", { className: "mt-2 text-sm text-text-light/70 dark:text-text-dark/70", children: "Sign in to your account" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "sr-only", children: "Email" }), _jsx("input", { ...register('email'), type: "email", id: "email", placeholder: "Email Address", className: "w-full rounded-lg border-subtle-light bg-background-light px-4 py-3 text-text-light placeholder-text-light/50 focus:border-primary focus:ring-primary dark:border-subtle-dark dark:bg-background-dark dark:text-text-dark dark:placeholder-text-dark/50 dark:focus:border-primary dark:focus:ring-primary", autoComplete: "email", required: true }), errors.email && (_jsx("p", { className: "mt-1 text-sm text-red-500", children: errors.email.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "sr-only", children: "Password" }), _jsx("input", { ...register('password'), type: "password", id: "password", placeholder: "Password", className: "w-full rounded-lg border-subtle-light bg-background-light px-4 py-3 text-text-light placeholder-text-light/50 focus:border-primary focus:ring-primary dark:border-subtle-dark dark:bg-background-dark dark:text-text-dark dark:placeholder-text-dark/50 dark:focus:border-primary dark:focus:ring-primary", autoComplete: "current-password", required: true }), errors.password && (_jsx("p", { className: "mt-1 text-sm text-red-500", children: errors.password.message }))] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading, className: "w-full rounded-lg bg-primary px-4 py-3 text-base font-bold text-white shadow-soft transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark", children: isLoading ? 'Signing In...' : 'Sign In' }) })] }), _jsxs("div", { className: "text-center text-sm text-text-light/70 dark:text-text-dark/70", children: [_jsxs("p", { className: "mb-2", children: ["Don't have an account?", _jsx("button", { onClick: () => navigate('/signup'), className: "ml-1 font-medium text-primary hover:underline", children: "Sign Up" })] }), _jsx("a", { href: "#", className: "font-medium text-primary hover:underline", children: "Forgot Password?" })] })] }) })] }));
};
export default LoginPage;
