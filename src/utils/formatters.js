// Common formatters and helpers for Krishi Bazaar

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 1
  }).format(amount);
};

export const formatWeight = (kg) => {
  if (!kg && kg !== 0) return '0 kg';
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Tonnes (${kg.toLocaleString('en-IN')} kg)`;
  }
  return `${kg.toLocaleString('en-IN')} kg`;
};

export const formatShortWeight = (kg) => {
  if (!kg && kg !== 0) return '0 kg';
  return `${kg.toLocaleString('en-IN')} kg`;
};

export const formatPercent = (val) => {
  if (val === undefined || val === null) return '0%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Active':
    case 'Fully Matched':
    case 'Delivered':
    case 'Collected':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Partially Matched':
    case 'Pickup Planned':
    case 'In Transit':
    case 'Self Pickup Scheduled':
    case 'Logistics Assigned/Pickup Planned':
    case 'Logistics Assigned':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Order Confirmed':
    case 'Confirmed':
    case 'Matched':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Cancelled':
    case 'Deactivated':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};
