import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const ProfilePicture = ({ src, alt = 'Profile Picture', size = 'md', editable = false, onImageChange, className = '' }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isHovered, setIsHovered] = useState(false);
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-20 h-20'
    };
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file && onImageChange) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }
            onImageChange(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };
    return (_jsx("div", { className: `relative ${sizeClasses[size]} ${className}`, children: _jsxs("div", { className: `${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-[#607AFB] to-[#4f68f2] flex items-center justify-center cursor-pointer transition-all duration-200 ${editable ? 'hover:opacity-80' : ''}`, onMouseEnter: () => editable && setIsHovered(true), onMouseLeave: () => editable && setIsHovered(false), children: [imageSrc ? (_jsx("img", { src: imageSrc, alt: alt, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "material-symbols-outlined text-white text-lg", children: "person" })), editable && (_jsxs(_Fragment, { children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleFileChange, className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer" }), isHovered && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-white text-sm", children: "edit" }) }))] }))] }) }));
};
export default ProfilePicture;
