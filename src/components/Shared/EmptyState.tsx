import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  actionText?: string;
  actionTo?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionText, actionTo }) => {
  return (
    <div className="text-center bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-lg p-12">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-black bg-opacity-30 text-[var(--primary-gold)]">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-medium text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
      {actionText && actionTo && (
        <div className="mt-6">
          <Link
            to={actionTo}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[var(--primary-gold)] hover:bg-yellow-300"
          >
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
};

export default EmptyState;