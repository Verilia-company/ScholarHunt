import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-lg h-full"></div>
    </div>
  );
}

export function ScholarshipCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col overflow-hidden border border-gray-100 p-6">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 pb-4 rounded-xl mb-4">
        <div className="flex gap-2 mb-4">
          <LoadingSkeleton className="h-6 w-20 rounded-full" />
          <LoadingSkeleton className="h-6 w-16 rounded-full" />
        </div>
        <LoadingSkeleton className="h-6 w-full mb-2" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </div>
      
      <div className="flex-grow">
        <LoadingSkeleton className="h-4 w-full mb-2" />
        <LoadingSkeleton className="h-4 w-5/6 mb-4" />
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <LoadingSkeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1">
              <LoadingSkeleton className="h-3 w-16 mb-1" />
              <LoadingSkeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LoadingSkeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1">
              <LoadingSkeleton className="h-3 w-16 mb-1" />
              <LoadingSkeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
      
      <LoadingSkeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col overflow-hidden border border-gray-100">
      <LoadingSkeleton className="h-48 w-full" />
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <LoadingSkeleton className="w-8 h-8 rounded-full" />
            <LoadingSkeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <LoadingSkeleton className="w-8 h-8 rounded-full" />
            <LoadingSkeleton className="h-4 w-16" />
          </div>
        </div>
        
        <LoadingSkeleton className="h-6 w-full mb-2" />
        <LoadingSkeleton className="h-6 w-4/5 mb-4" />
        
        <LoadingSkeleton className="h-4 w-full mb-2" />
        <LoadingSkeleton className="h-4 w-full mb-2" />
        <LoadingSkeleton className="h-4 w-3/4 mb-6" />
        
        <div className="flex items-center gap-2 mb-6">
          <LoadingSkeleton className="w-8 h-8 rounded-full" />
          <LoadingSkeleton className="h-4 w-24" />
        </div>
        
        <LoadingSkeleton className="h-12 w-full rounded-xl mt-auto" />
      </div>
    </div>
  );
}