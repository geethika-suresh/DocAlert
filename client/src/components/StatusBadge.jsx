// SRS: Colour-coded badges with text labels — meaning never relies on colour alone
import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status, daysRemaining, showDays = false }) => {
  const configs = {
    'Active':        { cls: 'badge-active',   icon: <CheckCircle size={12}/>,    label: 'Active' },
    'Expiring Soon': { cls: 'badge-expiring',  icon: <Clock size={12}/>,          label: 'Expiring Soon' },
    'Expired':       { cls: 'badge-expired',   icon: <AlertTriangle size={12}/>,  label: 'Expired' },
  };

  const cfg = configs[status] || configs['Active'];

  return (
    <span className={cfg.cls}>
      {cfg.icon}
      {cfg.label}
      {showDays && status !== 'Expired' && daysRemaining !== undefined && (
        <span className="ml-1">
          {daysRemaining === 0 ? '(today)' : `(${daysRemaining}d)`}
        </span>
      )}
    </span>
  );
};

export default StatusBadge;
