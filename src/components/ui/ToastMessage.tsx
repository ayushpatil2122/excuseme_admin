"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, X } from "lucide-react";

export interface ToastMessageProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

export default function ToastMessage({
  message,
  type,
  duration = 3000,
  onClose,
}: ToastMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700 border border-green-500";
      case "error":
        return "bg-red-100 text-red-700 border border-red-500";
      case "info":
        return "bg-blue-100 text-blue-700 border border-blue-500";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 px-6 py-3 rounded-2xl shadow-md flex items-center space-x-3 z-50 animate-slide-in w-auto",
        getStyles()
      )}
    >
      <CheckCircle className="w-5 h-5 text-green-500" />
      <span className="font-medium flex-1">{message}</span>
      <button onClick={() => setVisible(false)} className="text-gray-600 hover:text-gray-900">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
