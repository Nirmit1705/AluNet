import React from "react";
import { Bell, ChevronRight, X, UserPlus } from "lucide-react";

// This component is shared between Alumni and Student dashboards
const NotificationsSection = ({ 
  notifications = [], 
  toggleNotifications, 
  showNotificationsPanel,
  markNotificationAsRead,
  markAllNotificationsAsRead 
}) => {
  return (
    <>
      {/* Notifications Section */}
      <div className="glass-card rounded-xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Recent Notifications</h3>
          <button 
            className="relative group"
            onClick={toggleNotifications}
          >
            <Bell className="h-5 w-5 text-primary" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs rounded-full">
              {notifications.length}
            </span>
          </button>
        </div>
        <div className="space-y-3">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="flex p-3 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <div className="rounded-full bg-primary/10 p-2 mr-3">
                <notification.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{notification.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button 
          className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
          onClick={toggleNotifications}
        >
          View all notifications
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotificationsPanel && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Notifications</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-sm text-primary hover:underline"
                >
                  Mark all as read
                </button>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={toggleNotifications}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="flex p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="rounded-full bg-primary/10 p-2 mr-4">
                    <notification.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No notifications to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Sample data factory for notifications - can be used by parent components
export const createSampleNotifications = (userType) => {
  const baseNotifications = [
    {
      id: 1,
      title: "New message",
      description: "You have a new message from Sarah",
      time: "5 minutes ago",
      icon: Bell,
    },
    {
      id: 2,
      title: "Profile update",
      description: "Your profile information was updated successfully",
      time: "1 hour ago",
      icon: Bell,
    },
    {
      id: 3,
      title: "Job alert",
      description: "A new job matching your skills was posted",
      time: "2 hours ago",
      icon: Bell,
    }
  ];

  // Add role-specific notifications
  if (userType === 'alumni') {
    return [
      {
        id: 1,
        title: "New mentee request",
        description: "Emily Parker has requested mentorship",
        time: "5 minutes ago",
        icon: UserPlus,
      },
      ...baseNotifications
    ];
  } else {
    return baseNotifications;
  }
};

export default NotificationsSection; 