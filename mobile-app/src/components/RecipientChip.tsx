import { X, User } from 'lucide-react';

interface RecipientChipProps {
  phoneNumber: string;
  name?: string;
  onDelete: () => void;
}

export default function RecipientChip({
  phoneNumber,
  name,
  onDelete
}: RecipientChipProps) {
  // Get initials from name or use first 2 digits of phone
  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return phoneNumber.slice(-2);
  };

  return (
    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-1 pr-2 py-1 group hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
      {/* Avatar */}
      <div className="w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center text-xs font-semibold">
        {name ? getInitials() : <User className="w-4 h-4" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {name && <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{name}</p>}
        <p className="text-xs text-muted truncate">{phoneNumber}</p>
      </div>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="p-1 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
        aria-label={`Hapus ${name || phoneNumber}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
