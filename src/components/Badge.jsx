import React from 'react';

const Badge = ({ status, text }) => {
  const display = text || status;
  let variant = 'neutral';

  const normalized = (status || '').toUpperCase();

  if (['COMPLETED', 'PAID', 'ACTIVE', 'CONFIRMED'].includes(normalized)) {
    variant = 'success';
  } else if (['IN_PROGRESS', 'SCHEDULED', 'REQUESTED', 'PENDING'].includes(normalized)) {
    variant = 'warning';
  } else if (['CANCELLED', 'INACTIVE', 'REJECTED'].includes(normalized)) {
    variant = 'danger';
  } else if (['ADMIN', 'DOCTOR', 'INFO'].includes(normalized)) {
    variant = 'info';
  }

  return <span className={`badge badge-${variant}`}>{display}</span>;
};

export default Badge;
