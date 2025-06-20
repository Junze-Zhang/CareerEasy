'use client';

import React, { createContext, useContext, useState } from 'react';

interface NotificationData {
  id: string;
  message: string;
  action?: () => void;
  actionText?: string;
  timeout?: number;
}

interface NotificationContextType {
  notifications: NotificationData[];
  addNotification: (notification: Omit<NotificationData, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after timeout (default 10 seconds)
    const timeout = notification.timeout || 10000;
    setTimeout(() => {
      removeNotification(id);
    }, timeout);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications
    }}>
      {children}
      
      {/* Notification Display */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-fade-in-up"
          >
            <span className="text-sm flex-1">{notification.message}</span>
            {notification.action && notification.actionText && (
              <button
                onClick={() => {
                  notification.action?.();
                  removeNotification(notification.id);
                }}
                className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-3 py-1 rounded text-sm transition-colors font-medium whitespace-nowrap"
              >
                {notification.actionText}
              </button>
            )}
            <button
              onClick={() => removeNotification(notification.id)}
              className="hover:bg-gray-700 rounded p-2 transition-colors text-lg leading-none min-w-[24px] h-6 flex items-center justify-center"
              title="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}