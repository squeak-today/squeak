import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2Icon, AlertCircleIcon, X } from 'lucide-react';

type NotificationType = 'error' | 'success';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  isLeaving?: boolean;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function NotificationAlert({ notification, onDismiss }: { 
  notification: Notification; 
  onDismiss: (id: number) => void;
}) {
  const Icon = notification.type === 'success' ? CheckCircle2Icon : AlertCircleIcon;
  
  return (
    <Alert 
      variant={notification.type === 'error' ? 'destructive' : 'default'}
      className={cn(
        "relative shadow-lg transition-all duration-300 cursor-pointer",
        notification.type === 'success' && "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50",
        notification.isLeaving && "animate-out fade-out-80 slide-out-to-right-full"
      )}
      onClick={() => onDismiss(notification.id)}
    >
      <Icon className="h-4 w-4" />
      <AlertDescription className="pr-6">
        {notification.message}
      </AlertDescription>
      <button
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
          notification.type === 'success' 
            ? "text-green-500 hover:text-green-600 focus:ring-green-400 dark:text-green-400" 
            : "text-destructive hover:text-destructive/80 focus:ring-destructive/20"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    const timeout = type === 'error' ? 10000 : 3000;
    setTimeout(() => {
      handleNotificationDismiss(id);
    }, timeout);
  };

  const handleNotificationDismiss = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isLeaving: true } : notif
      )
    );
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 300);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2">
        {notifications.map((notification) => (
          <NotificationAlert 
            key={notification.id}
            notification={notification}
            onDismiss={handleNotificationDismiss}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 