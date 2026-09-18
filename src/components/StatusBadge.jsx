import React from 'react';
import { getStatusBadgeStyle } from '../utils/formatters';

export default function StatusBadge({ status, className = '' }) {
  const style = getStatusBadgeStyle(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status}
    </span>
  );
}
