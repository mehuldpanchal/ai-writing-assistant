import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  className = "",
  type = "button",
  disabled = false,
  icon: Icon,
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center h-12 rounded-full px-6 py-2 font-medium text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="mr-2 text-white" />}
      {children}
    </button>
  );
}