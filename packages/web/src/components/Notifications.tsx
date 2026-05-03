import React from 'react';
import { useNotificationStore, NotificationType } from '../stores/useNotificationStore';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const styles: Record<NotificationType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col space-y-2 max-w-sm w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start p-4 rounded-lg border shadow-lg transition-all duration-300 animate-in slide-in-from-right ${styles[n.type]}`}
        >
          <div className="flex-shrink-0 mr-3">{icons[n.type]}</div>
          <div className="flex-1 text-sm font-medium">{n.message}</div>
          <button
            onClick={() => removeNotification(n.id)}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
