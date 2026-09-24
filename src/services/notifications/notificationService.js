import { LocalNotifications } from "@capacitor/local-notifications";

export async function requestNotificationPermission() {
  const result = await LocalNotifications.requestPermissions();

  return result.display === "granted";
}

export async function getNotificationPermission() {
  const result = await LocalNotifications.checkPermissions();

  return result.display;
}