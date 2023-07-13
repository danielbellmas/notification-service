import axios from 'axios';
import { NotificationBl } from './notification.bl';
import { todosMock } from '../mocks/todosMock';
import { Todo } from '../models/todo';
import { getDateNDaysFromNow, getTodayDate, getTomorrowDate } from '../utils/date';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NotificationBl', () => {
  let notificationBl: NotificationBl;

  beforeEach(() => {
    notificationBl = new NotificationBl();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllTodos', () => {
    it('should return todos', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: todosMock });

      const todos = await notificationBl.getAllTodos();

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/todos'));
      expect(todos).toEqual(todosMock);
    });

    it('should throw an error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Error'));

      const todos = await notificationBl.getAllTodos();

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/todos'));
      expect(todos).toBeUndefined();
    });
  });

  describe('removeDeletedTodos', () => {
    it('should remove deleted todos from notifiedTodoList', () => {
      const currTodosMock = [{ _id: '1' }, { _id: '2' }] as Todo[];

      notificationBl.setNotifiedTodoList(['1', '2', '3']);

      notificationBl.removeDeletedTodos(currTodosMock);

      expect(notificationBl.getNotifiedTodoList()).toEqual(currTodosMock.map(({ _id }) => _id));
    });
  });

  describe('shouldSendNotification', () => {
    it('should return true if deadline is near', () => {
      const todoMock: Todo = { _id: '1', title: 'title', deadline: getTodayDate() };

      const shouldSendNotification = notificationBl.shouldSendNotification(todoMock);

      expect(shouldSendNotification).toBeTruthy();
    });

    it('should return true if deadline is near and todo has not been notified already', () => {
      const todoMock: Todo = { _id: '1', title: 'title', deadline: getTodayDate() };

      const shouldSendNotification = notificationBl.shouldSendNotification(todoMock);

      expect(shouldSendNotification).toBeTruthy();
    });

    it('should return false if deadline is near but todo has been notified already', () => {
      const notifiedTodoIdMock = '1';
      const todoMock: Todo = { _id: notifiedTodoIdMock, title: 'title', deadline: getTodayDate() };

      notificationBl.setNotifiedTodoList([notifiedTodoIdMock]);

      const shouldSendNotification = notificationBl.shouldSendNotification(todoMock);

      expect(shouldSendNotification).toBeFalsy();
    });

    it('should return false if deadline has passed already', () => {
      const todoMock: Todo = { _id: '1', title: 'title', deadline: new Date('2020-01-01') };

      const shouldSendNotification = notificationBl.shouldSendNotification(todoMock);

      expect(shouldSendNotification).toBeFalsy();
    });

    it('should return false if deadline has passed and todo has been notified already', () => {
      const notifiedTodoIdMock = '1';
      const todoMock: Todo = { _id: notifiedTodoIdMock, title: 'title', deadline: new Date('2020-01-01') };

      notificationBl.setNotifiedTodoList([notifiedTodoIdMock]);

      const shouldSendNotification = notificationBl.shouldSendNotification(todoMock);

      expect(shouldSendNotification).toBeFalsy();
    });
  });

  describe('didDeadlineMoveAndNotified', () => {
    it('should return true if deadline has updated and todo has been notified already', () => {
      const notifiedTodoIdMock = '1';

      const todoMock: Todo = { _id: notifiedTodoIdMock, title: 'title', deadline: getTomorrowDate() };

      notificationBl.setNotifiedTodoList([notifiedTodoIdMock]);

      const didDeadlineMoveAndNotified = notificationBl.didDeadlineMoveAndNotified(todoMock);

      expect(didDeadlineMoveAndNotified).toBeTruthy();
    });

    it('should return false if deadline has moved but todo has not been notified already', () => {
      const todoMock: Todo = { _id: '1', title: 'title', deadline: new Date('2020-01-01') };

      const didDeadlineMoveAndNotified = notificationBl.didDeadlineMoveAndNotified(todoMock);

      expect(didDeadlineMoveAndNotified).toBeFalsy();
    });
  });

  describe('sendNotificationHandler', () => {
    it('should do nothing if could not fetch the todos', async () => {
      notificationBl.getAllTodos = jest.fn().mockRejectedValueOnce(new Error('Error'));

      notificationBl.sendNotification = jest.fn();
      notificationBl.removeDeletedTodos = jest.fn();

      await notificationBl.sendNotificationHandler();

      expect(notificationBl.getAllTodos).toHaveBeenCalled();
      expect(notificationBl.sendNotification).not.toHaveBeenCalled();
      expect(notificationBl.removeDeletedTodos).not.toHaveBeenCalled();
    });

    it('should send notifications for relevant todos and update notifiedTodoList', async () => {
      const toBeNotifiedTodoMock = { _id: '1', title: 'title', deadline: getTomorrowDate() };
      const notToBeNotifiedTodoMock = { _id: '2', title: 'title', deadline: getDateNDaysFromNow(-2) };

      const allTodosMock = [toBeNotifiedTodoMock, notToBeNotifiedTodoMock];

      notificationBl.getAllTodos = jest.fn().mockResolvedValue(allTodosMock);

      notificationBl.sendNotification = jest.fn();
      notificationBl.removeDeletedTodos = jest.fn();

      const currNotifiedTodoList = [notToBeNotifiedTodoMock._id];
      notificationBl.setNotifiedTodoList(currNotifiedTodoList);

      await notificationBl.sendNotificationHandler();

      expect(notificationBl.getAllTodos).toHaveBeenCalled();
      expect(notificationBl.sendNotification).toHaveBeenCalledWith(toBeNotifiedTodoMock);
      expect(notificationBl.getNotifiedTodoList()).toEqual([...currNotifiedTodoList, toBeNotifiedTodoMock._id]);
      expect(notificationBl.removeDeletedTodos).toHaveBeenCalledWith(allTodosMock);
    });

    it('should not send notification if deadline has passed already', async () => {
      const todoMock = { _id: '1', title: 'title', deadline: getDateNDaysFromNow(-2) };

      notificationBl.getAllTodos = jest.fn().mockResolvedValue([todoMock]);

      notificationBl.sendNotification = jest.fn();
      notificationBl.removeDeletedTodos = jest.fn();

      await notificationBl.sendNotificationHandler();

      expect(notificationBl.getAllTodos).toHaveBeenCalled();
      expect(notificationBl.sendNotification).not.toHaveBeenCalled();
      expect(notificationBl.getNotifiedTodoList()).toEqual([]);
      expect(notificationBl.removeDeletedTodos).toHaveBeenCalledWith([todoMock]);
    });

    it('should remove notified todos from notifiedTodoList if they have been moved', async () => {
      const hasBeenNotifiedTodoMock = { _id: '1', title: 'title', deadline: getDateNDaysFromNow(-1) };
      const hasBeenNotifiedAndMovedMock = { _id: '2', title: 'title', deadline: getDateNDaysFromNow(3) };

      const allTodosMock = [hasBeenNotifiedTodoMock, hasBeenNotifiedAndMovedMock];

      notificationBl.getAllTodos = jest.fn().mockResolvedValue(allTodosMock);
      notificationBl.didDeadlineMoveAndNotified = jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
      notificationBl.removeDeletedTodos = jest.fn();

      const currNotifiedTodoList = allTodosMock.map(({ _id }) => _id);
      notificationBl.setNotifiedTodoList(currNotifiedTodoList);

      await notificationBl.sendNotificationHandler();

      expect(notificationBl.getAllTodos).toHaveBeenCalled();
      expect(notificationBl.didDeadlineMoveAndNotified).toHaveBeenCalledWith(hasBeenNotifiedAndMovedMock);
      expect(notificationBl.getNotifiedTodoList()).toEqual([hasBeenNotifiedTodoMock._id]);
      expect(notificationBl.removeDeletedTodos).toHaveBeenCalledWith(allTodosMock);
    });
  });
});
