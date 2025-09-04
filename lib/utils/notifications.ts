import type { NotificationResponse } from "@/lib/types/notification";
import { notificationIcons, notificationColors } from "@/lib/types/notification";

export function getNotificationIcon(type: NotificationResponse['type']): string {
  return notificationIcons[type] || notificationIcons.INFO;
}

export function getNotificationColor(type: NotificationResponse['type']): string {
  return notificationColors[type] || notificationColors.INFO;
}

export function getNotificationColorClass(type: NotificationResponse['type']): string {
  const color = getNotificationColor(type);
  
  const colorClassMap: Record<string, string> = {
    blue: "blue",
    green: "green",
    red: "red",
    orange: "orange",
    gray: "gray",
  };
  
  return colorClassMap[color] || "gray";
}

export function formatNotificationTime(createdAt: string): string {
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const diffInMs = now.getTime() - notificationDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return notificationDate.toLocaleDateString();
  }
}

export function getNotificationPriority(type: NotificationResponse['type']): 'high' | 'medium' | 'low' {
  switch (type) {
    case 'ALERT':
      return 'high';
    case 'REMINDER':
    case 'INVITE':
      return 'medium';
    case 'DOCUMENT':
    case 'INFO':
    default:
      return 'low';
  }
}

export function shouldShowToast(notification: NotificationResponse): boolean {
  const priority = getNotificationPriority(notification.type);
  return priority === 'high' || priority === 'medium';
}

export function groupNotificationsByDate(notifications: NotificationResponse[]): Record<string, NotificationResponse[]> {
  const grouped: Record<string, NotificationResponse[]> = {};
  
  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    
    if (isSameDay(date, today)) {
      dateKey = 'Today';
    } else if (isSameDay(date, yesterday)) {
      dateKey = 'Yesterday';
    } else if (isWithinDays(date, today, 7)) {
      dateKey = date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(notification);
  });
  
  return grouped;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function isWithinDays(date: Date, referenceDate: Date, days: number): boolean {
  const diffTime = referenceDate.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}