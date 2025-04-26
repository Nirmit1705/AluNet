import React from "react";
import { Bell, Calendar, Briefcase, GraduationCap, ChevronRight } from "lucide-react";

// Sample notifications data
const notifications = [
  {
    id: 1,
    type: "mentor",
    message: "David Kim accepted your mentorship request",
    time: "Just now",
    icon: GraduationCap,
    read: false
  },
  {
    id: 2,
    type: "job",
    message: "New job match: Junior Developer at TechCorp",
    time: "2 hours ago",
    icon: Briefcase,
    read: false
  },
  {
    id: 3,
    type: "assessment",
    message: "Your JavaScript assessment results are ready",
    time: "Yesterday",
    icon: Calendar,
    read: true
  },
  {
    id: 4,
    type: "mentor",
    message: "Jennifer Lee responded to your question",
    time: "2 days ago",
    icon: GraduationCap,
    read: true
  }
];

const NotificationsSection = () => {
  // In a real app, this would handle reading notifications
  const markAsRead = (notificationId) => {
    // Implement mark as read functionality
    console.log(`Marking notification ${notificationId} as read`);
  };

  // Navigate to notifications page
  const viewAllNotifications = () => {
    // This would navigate to a full notifications page
    alert("Navigating to all notifications");
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Notifications</h3>
        <Bell className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div 
              key={notification.id}
              className={`flex items-start p-3 rounded-lg transition-colors ${notification.read ? 'opacity-75' : 'bg-primary/5 dark:bg-primary/10'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${notification.read ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary/20 text-primary'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-primary mt-1" />
              )}
            </div>
          );
        })}
      </div>
      
      <button 
        className="w-full mt-6 text-sm text-primary font-medium flex items-center justify-center"
        onClick={viewAllNotifications}
      >
        View all notifications
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default NotificationsSection; 