import axios from 'axios';
import config from '../config';
import { Todo } from '../models/todo';
import { getTodayDate } from '../utils/date';

export class NotificationBl {
  private notifiedTodoList: string[] = [];

  getNotifiedTodoList(): string[] {
    return this.notifiedTodoList;
  }

  setNotifiedTodoList(notifiedTodoList: string[]): void {
    this.notifiedTodoList = notifiedTodoList;
  }

  async getAllTodos(): Promise<Todo[] | undefined> {
    try {
      const response = await axios.get(`${config.todosServiceUrl}/todos`);
      return response.data;
    } catch (error) {
      console.error('Error getting todos', error);
    }
  }

  async sendNotification(todo: Todo): Promise<void> {
    // Assumed to be implemented
  }

  removeDeletedTodos(todos: Todo[]) {
    const todosIds = todos.map(({ _id }) => _id);

    this.notifiedTodoList = this.notifiedTodoList.filter(notifiedTodoId => todosIds.includes(notifiedTodoId));
  }

  shouldSendNotification(todo: Todo): boolean {
    const now = getTodayDate().getTime();
    const timeDiff = new Date(todo.deadline).getTime() - now;

    const hasBeenNotified = this.notifiedTodoList.includes(todo._id);

    return !hasBeenNotified && timeDiff <= config.deadlineBufferTime && timeDiff >= 0;
  }

  didDeadlineMoveAndNotified(todo: Todo): boolean {
    const now = getTodayDate().getTime();
    const timeDiff = new Date(todo.deadline).getTime() - now;

    const hasBeenNotified = this.notifiedTodoList.includes(todo._id);

    return hasBeenNotified && timeDiff >= config.deadlineBufferTime;
  }

  async sendNotificationHandler() {
    try {
      const todos = await this.getAllTodos();

      if (!todos) {
        return;
      }

      for (const todo of todos) {
        if (this.shouldSendNotification(todo)) {
          await this.sendNotification(todo);
          this.notifiedTodoList = [...this.notifiedTodoList, todo._id];
        } else if (this.didDeadlineMoveAndNotified(todo)) {
          this.notifiedTodoList = this.notifiedTodoList.filter(notifiedTodoId => notifiedTodoId !== todo._id);
        }
      }

      this.removeDeletedTodos(todos);
    } catch (error) {
      console.error('Error getting todos and/or sending notifications:', error);
    }
  }
}
