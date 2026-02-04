import React from 'react';

interface FamiliarLogoProps {
  className?: string;
}

export const FamiliarLogo: React.FC<FamiliarLogoProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stylized paw print */}
      <ellipse cx="12" cy="16" rx="4" ry="5" />
      <circle cx="6" cy="10" r="2.5" />
      <circle cx="18" cy="10" r="2.5" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="6" r="2" />
    </svg>
  );
};
