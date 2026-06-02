import React from "react";

export default function ErrorMessage() {
  return (
    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
      Failed to load data. Please refresh the page.
    </div>
  );
}