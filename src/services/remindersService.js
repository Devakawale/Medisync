import { LocalNotifications } from "@capacitor/local-notifications";

const MEDICINES_STORAGE_KEY = "medisync_medicines";

const NOTIFICATION_CHANNEL_ID = "medisync-medicine-reminders";

let schedulerStarted = false;

/* ---------------------------------------------------------
   SAFE STORAGE
--------------------------------------------------------- */

function getMedicines() {
  try {
    const storedMedicines = localStorage.getItem(
      MEDICINES_STORAGE_KEY
    );

    if (!storedMedicines) {
      return [];
    }

    const parsedMedicines = JSON.parse(storedMedicines);

    if (!Array.isArray(parsedMedicines)) {
      return [];
    }

    return parsedMedicines;
  } catch (error) {
    console.error(
      "MediSync: Failed to read medicines",
      error
    );

    return [];
  }
}

/* ---------------------------------------------------------
   ANDROID NOTIFICATION CHANNEL
--------------------------------------------------------- */

async function createNotificationChannel() {
  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: "Medicine Reminders",
      description:
        "Notifications for scheduled MediSync medicine reminders.",
      importance: 5,
      visibility: 1,
      sound: "default",
      vibration: true,
    });
  } catch (error) {
    console.error(
      "MediSync: Failed to create notification channel",
      error
    );
  }
}

/* ---------------------------------------------------------
   PERMISSION
--------------------------------------------------------- */

export async function requestNotificationPermission() {
  try {
    const current =
      await LocalNotifications.checkPermissions();

    if (current.display === "granted") {
      await createNotificationChannel();
      return "granted";
    }

    const result =
      await LocalNotifications.requestPermissions();

    if (result.display === "granted") {
      await createNotificationChannel();
      return "granted";
    }

    return result.display;
  } catch (error) {
    console.error(
      "MediSync: Native notification permission failed",
      error
    );

    return "denied";
  }
}

export async function getNotificationPermission() {
  try {
    const result =
      await LocalNotifications.checkPermissions();

    return result.display;
  } catch (error) {
    console.error(
      "MediSync: Failed to check notification permission",
      error
    );

    return "denied";
  }
}

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

function parseTime(time) {
  if (
    typeof time !== "string" ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return null;
  }

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return {
    hours,
    minutes,
  };
}

/*
  Generates a stable numeric notification ID.

  Capacitor notification IDs must be numbers.
*/
function createNotificationId(
  medicineId,
  timeIndex
) {
  const source =
    `${medicineId}-${timeIndex}`;

  let hash = 0;

  for (let index = 0; index < source.length; index++) {
    hash =
      (hash * 31 +
        source.charCodeAt(index)) |
      0;
  }

  return Math.abs(hash) % 2147483647 || 1;
}

/* ---------------------------------------------------------
   CANCEL ALL MEDISYNC MEDICINE NOTIFICATIONS
--------------------------------------------------------- */

export async function cancelAllMedicineNotifications() {
  try {
    const pending =
      await LocalNotifications.getPending();

    const ids = pending.notifications
      .filter((notification) =>
        notification.channelId ===
        NOTIFICATION_CHANNEL_ID
      )
      .map((notification) => ({
        id: notification.id,
      }));

    if (ids.length) {
      await LocalNotifications.cancel({
        notifications: ids,
      });
    }
  } catch (error) {
    console.error(
      "MediSync: Failed to cancel medicine notifications",
      error
    );
  }
}

/* ---------------------------------------------------------
   SCHEDULE MEDICINE NOTIFICATIONS
--------------------------------------------------------- */

export async function scheduleMedicineReminders() {
  try {
    const permission =
      await getNotificationPermission();

    if (permission !== "granted") {
      console.warn(
        "MediSync: Notification permission not granted."
      );

      return {
        success: false,
        reason: "permission-not-granted",
        scheduled: 0,
      };
    }

    await createNotificationChannel();

    /*
      Remove previously scheduled MediSync
      medicine reminders before rebuilding them.

      This prevents duplicates after:
      - medicine edit
      - medicine add
      - app restart
      - scheduler restart
    */
    await cancelAllMedicineNotifications();

    const medicines = getMedicines();

    const notifications = [];

    medicines.forEach((medicine) => {
      if (!medicine?.id) {
        return;
      }

      if (medicine.reminderEnabled !== true) {
        return;
      }

      if (!Array.isArray(medicine.times)) {
        return;
      }

      medicine.times.forEach(
        (scheduledTime, timeIndex) => {
          const parsedTime =
            parseTime(scheduledTime);

          if (!parsedTime) {
            return;
          }

          const medicineName =
            medicine.name?.trim() ||
            "Medicine";

          const dosage =
            medicine.dosage?.trim() ||
            "Dose not specified";

          const notificationId =
            createNotificationId(
              medicine.id,
              timeIndex
            );

          /*
            Daily recurring notification.
          */
          notifications.push({
            id: notificationId,

            title:
              `Medicine Reminder: ${medicineName}`,

            body:
              `Take ${dosage}`,

            schedule: {
              on: {
                hour: parsedTime.hours,
                minute: parsedTime.minutes,
              },
              allowWhileIdle: true,
            },

            channelId:
              NOTIFICATION_CHANNEL_ID,

            sound: "default",

            smallIcon:
              "ic_launcher",

            extra: {
              type: "medicine-reminder",
              medicineId: medicine.id,
              medicineName,
              dosage,
              scheduledTime,
            },
          });
        }
      );
    });

    if (!notifications.length) {
      return {
        success: true,
        scheduled: 0,
      };
    }

    await LocalNotifications.schedule({
      notifications,
    });

    console.log(
      `MediSync: Scheduled ${notifications.length} medicine reminders.`
    );

    return {
      success: true,
      scheduled: notifications.length,
    };
  } catch (error) {
    console.error(
      "MediSync: Failed to schedule medicine reminders",
      error
    );

    return {
      success: false,
      reason: "schedule-failed",
      scheduled: 0,
      error,
    };
  }
}

/* ---------------------------------------------------------
   TEST NOTIFICATION
--------------------------------------------------------- */

export async function scheduleTestNotification(
  seconds = 10
) {
  try {
    const permission =
      await getNotificationPermission();

    if (permission !== "granted") {
      return {
        success: false,
        reason: "permission-not-granted",
      };
    }

    await createNotificationChannel();

    const notificationId =
      999999;

    await LocalNotifications.cancel({
      notifications: [
        {
          id: notificationId,
        },
      ],
    }).catch(() => {});

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,

          title: "MediSync Test Reminder",

          body:
            "Your MediSync notification system is working.",

          schedule: {
            at: new Date(
              Date.now() +
                seconds * 1000
            ),
            allowWhileIdle: true,
          },

          channelId:
            NOTIFICATION_CHANNEL_ID,

          sound: "default",

          smallIcon:
            "ic_launcher",

          extra: {
            type: "test-reminder",
          },
        },
      ],
    });

    console.log(
      `MediSync: Test notification scheduled in ${seconds} seconds.`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "MediSync: Test notification failed",
      error
    );

    return {
      success: false,
      reason: "schedule-failed",
      error,
    };
  }
}

/* ---------------------------------------------------------
   START REMINDER SCHEDULER
--------------------------------------------------------- */

export async function startReminderScheduler() {
  if (schedulerStarted) {
    return stopReminderScheduler;
  }

  schedulerStarted = true;

  try {
    const permission =
      await getNotificationPermission();

    if (permission === "granted") {
      await createNotificationChannel();
      await scheduleMedicineReminders();
    }
  } catch (error) {
    console.error(
      "MediSync: Reminder scheduler startup failed",
      error
    );
  }

  return stopReminderScheduler;
}

/* ---------------------------------------------------------
   STOP REMINDER SCHEDULER
--------------------------------------------------------- */

export function stopReminderScheduler() {
  /*
    Native scheduled notifications must NOT be cancelled
    when the React page unmounts.

    Android itself owns the scheduled notification.
  */

  schedulerStarted = false;
}

/* ---------------------------------------------------------
   ENABLE NOTIFICATIONS
--------------------------------------------------------- */

export async function enableNotifications() {
  const permission =
    await requestNotificationPermission();

  if (permission === "granted") {
    await scheduleMedicineReminders();
  }

  return permission;
}

/* ---------------------------------------------------------
   STATUS
--------------------------------------------------------- */

export async function areNotificationsEnabled() {
  const permission =
    await getNotificationPermission();

  return permission === "granted";
}