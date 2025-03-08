"use client"
import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    title?: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = Math.random().toString(36).substring(2);
        const newNotification = { ...notification, id };

        setNotifications(prev => [...prev, newNotification]);

        if (notification.duration !== Infinity) {
            setTimeout(() => {
                removeNotification(id);
            }, notification.duration || 5000);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};

const NotificationContainer: React.FC = () => {
    const context = useContext(NotificationContext);
    if (!context) return null;

    const { notifications, removeNotification } = context;

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ease-in-out ${getNotificationStyles(
                        notification.type
                    )}`}
                >
                    {notification.title && (
                        <h4 className="font-medium mb-1">{notification.title}</h4>
                    )}
                    <p className="text-sm">{notification.message}</p>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="absolute top-2 right-2 text-current opacity-50 hover:opacity-100"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

function getNotificationStyles(type: NotificationType): string {
    switch (type) {
        case 'success':
            return 'bg-green-100 text-green-800 border-l-4 border-green-500';
        case 'error':
            return 'bg-red-100 text-red-800 border-l-4 border-red-500';
        case 'warning':
            return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
        case 'info':
            return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
        default:
            return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    }
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};