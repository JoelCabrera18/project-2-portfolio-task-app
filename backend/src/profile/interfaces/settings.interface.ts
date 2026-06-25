export interface EmailNotifications {
  newMember: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  commentMentioned: boolean;
  dailyDigest: boolean;
}

export interface Notifications {
  email: EmailNotifications;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  notifications: Notifications;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  language: 'es',
  notifications: {
    email: {
      newMember: true,
      taskAssigned: true,
      taskCompleted: false,
      commentMentioned: true,
      dailyDigest: false,
    },
  },
};
