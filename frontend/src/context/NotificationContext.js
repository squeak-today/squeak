import React, { createContext, useContext, useState } from 'react';
import { NotificationContainer, NotificationsWrapper } from '../styles/ContextStyles';

const NotificationContext = createContext();

// USAGE
// import { useNotification } from '/path/to/NotificationContext';
// inside of component:
// const { showNotification } = useNotification();
// then:
// showNotification('This is an error', 'error')
// or:
// showNotification('This is a success', 'success')
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const showNotification = (message, type = 'error') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        
        const timeout = type === 'error' ? 10000 : 3000;
        setTimeout(() => {
            handleNotificationDismiss(id);
        }, timeout);
    };

    const handleNotificationDismiss = (id) => {
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

export const useNotification = () => useContext(NotificationContext); 