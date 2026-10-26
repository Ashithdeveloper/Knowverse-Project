import React from "react";

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClass = `loading-${size}`;

  return (
    <span
      className={`loading loading-spinner text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] ${sizeClass} ${className}`}
    />
  );
};

export default LoadingSpinner;
