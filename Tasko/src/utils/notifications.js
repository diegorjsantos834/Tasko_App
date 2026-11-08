import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { dateWithTime } from './dates';

const CHANNEL = 'tasko';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Tasko',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch (e) {
    return false;
  }
}

// Lembrete de tarefa: avisa  minutos antes do horário de início
// (se a tarefa não tem horário, avisa às 09:00 do dia)
export async function scheduleTaskReminder(task, defaultLead) {
  try {
    const lead = task.lead ?? defaultLead;
    const when = dateWithTime(task.date, task.start);
    if (task.start) when.setMinutes(when.getMinutes() - lead);
    if (when.getTime() <= Date.now()) return null;
    let body = 'Tarefa de hoje.';
    if (task.start) body = lead ? `Começa em ${lead} min (${task.start}).` : `Começa agora (${task.start}).`;
    return await Notifications.scheduleNotificationAsync({
      content: { title: task.title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
    });
  } catch (e) {
    return null;
  }
}

// Aviso de fim de sessão do modo de foco
export async function scheduleIn(seconds, title, body) {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.ceil(seconds)), channelId: CHANNEL },
    });
  } catch (e) {
    return null;
  }
}

export async function cancelNotification(id) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {}
}
