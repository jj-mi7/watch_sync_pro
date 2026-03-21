import notifee, { AndroidImportance } from "@notifee/react-native";

export const NotificationService = {
  /**
   * Requests permission to send notifications (required for iOS and Android 13+)
   */
  async requestPermissions() {
    await notifee.requestPermission();
  },

  /**
   * Displays a local notification for goal achievement or proximity
   */
  async displayGoalNotification(title: string, body: string) {
    try {
      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: "goals",
        name: "Goal Alerts",
        importance: AndroidImportance.HIGH,
      });

      // Display a notification
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          smallIcon: "ic_launcher", // Uses the default app icon
          color: "#00E5FF", // Cyan neo theme color
          pressAction: {
            id: "default",
          },
        },
      });
    } catch (e) {
      console.warn("Notification error:", e);
    }
  },
};
