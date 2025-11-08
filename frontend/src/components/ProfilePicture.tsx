import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface ProfilePictureProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onImageChange?: (file: File) => void;
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  alt = 'Profile Picture',
  size = 'md',
  editable = false,
  onImageChange,
  className = ''
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);
  const [isHovered, setIsHovered] = useState(false);

  // Update imageSrc when src prop changes
  useEffect(() => {
    if (src) {
      setImageSrc(src);
    }
  }, [src]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-20 h-20'
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-[#607AFB] to-[#4f68f2] flex items-center justify-center cursor-pointer transition-all duration-200 ${
          editable ? 'hover:opacity-80' : ''
        }`}
        onMouseEnter={() => editable && setIsHovered(true)}
        onMouseLeave={() => editable && setIsHovered(false)}
      >
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-1/2 h-1/2 text-white" />
        )}
        
        {editable && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {isHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePicture;
