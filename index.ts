import config from './config';
import { NotificationBl } from './bl/notification.bl';

const notificationBl = new NotificationBl();

setInterval(() => notificationBl.sendNotificationHandler(), config.notificationInterval);
