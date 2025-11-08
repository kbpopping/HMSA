import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const CreateHospital = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        timezone: '',
        adminEmail: '',
        adminPassword: '',
        adminConfirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Basic validation
        if (!formData.name || !formData.country || !formData.timezone ||
            !formData.adminEmail || !formData.adminPassword) {
            setError('Please fill all required fields');
            return;
        }
        if (formData.adminPassword !== formData.adminConfirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            // Mock API call - in a real app, this would call your backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Redirect to hospitals list or dashboard
            navigate('/super/dashboard');
        }
        catch (err) {
            setError('Failed to create hospital. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Create New Hospital" }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "max-w-2xl space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "Hospital Name *" }), _jsx("input", { type: "text", id: "name", name: "name", value: formData.name, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "country", className: "block text-sm font-medium text-gray-700 mb-1", children: "Country *" }), _jsxs("select", { id: "country", name: "country", value: formData.country, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Select Country" }), _jsx("option", { value: "US", children: "United States" }), _jsx("option", { value: "CA", children: "Canada" }), _jsx("option", { value: "UK", children: "United Kingdom" }), _jsx("option", { value: "AU", children: "Australia" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "timezone", className: "block text-sm font-medium text-gray-700 mb-1", children: "Timezone *" }), _jsxs("select", { id: "timezone", name: "timezone", value: formData.timezone, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Select Timezone" }), _jsx("option", { value: "America/New_York", children: "Eastern Time (ET)" }), _jsx("option", { value: "America/Chicago", children: "Central Time (CT)" }), _jsx("option", { value: "America/Denver", children: "Mountain Time (MT)" }), _jsx("option", { value: "America/Los_Angeles", children: "Pacific Time (PT)" })] })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h2", { className: "text-lg font-medium mb-4", children: "Admin Account" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "adminEmail", className: "block text-sm font-medium text-gray-700 mb-1", children: "Admin Email *" }), _jsx("input", { type: "email", id: "adminEmail", name: "adminEmail", value: formData.adminEmail, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500", required: true })] }), _jsxs("div", { className: "md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "adminPassword", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password *" }), _jsx("input", { type: "password", id: "adminPassword", name: "adminPassword", value: formData.adminPassword, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "adminConfirmPassword", className: "block text-sm font-medium text-gray-700 mb-1", children: "Confirm Password *" }), _jsx("input", { type: "password", id: "adminConfirmPassword", name: "adminConfirmPassword", value: formData.adminConfirmPassword, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500", required: true })] })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx("button", { type: "button", onClick: () => navigate('/super/dashboard'), className: "px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isLoading, className: "px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50", children: isLoading ? 'Creating...' : 'Create Hospital' })] })] })] }));
};
export default CreateHospital;
