import React, { createContext, useContext, useState } from 'react';
import { NotificationContainer, NotificationsWrapper } from '../styles/ContextStyles';

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

// USAGE
// import { useNotification } from '/path/to/NotificationContext';
// inside of component:
// const { showNotification } = useNotification();
// then:
// showNotification('This is an error', 'error')
// or:
// showNotification('This is a success', 'success')
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
            <NotificationsWrapper>
                {notifications.map((notification) => (
                    <NotificationContainer 
                        key={notification.id}
                        $type={notification.type}
                        $isLeaving={notification.isLeaving}
                        onClick={() => handleNotificationDismiss(notification.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {notification.message}
                    </NotificationContainer>
                ))}
            </NotificationsWrapper>
        </NotificationContext.Provider>
    );
}

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
} 