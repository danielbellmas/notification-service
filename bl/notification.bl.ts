import axios from 'axios';
import config from '../config';
import { Todo } from '../models/todo';

export class NotificationBl {
  private notifiedTodoList: string[] = [];

  async getAllTodos(): Promise<Todo[]> {
    const response = await axios.get(`${config.todosServiceUrl}/todos`);
    return response.data;
  }

  async sendNotification(todo: Todo): Promise<void> {
    // Assumed to be implemented
  }

  removeDeletedTodos(todos: Todo[]) {
    const todosIds = todos.map(({ _id }) => _id);

    this.notifiedTodoList = this.notifiedTodoList.filter(notifiedTodoId => todosIds.includes(notifiedTodoId));
  }

  shouldSendNotification(todo: Todo): boolean {
    const now = new Date().getTime();
    const timeDiff = new Date(todo.deadline).getTime() - now;

    const hasBeenNotified = this.notifiedTodoList.includes(todo._id);

    return !hasBeenNotified && timeDiff <= config.deadlineBufferTime;
  }

  didDeadlineMoveAndNotified(todo: Todo): boolean {
    const now = new Date().getTime();
    const timeDiff = new Date(todo.deadline).getTime() - now;

    const hasBeenNotified = this.notifiedTodoList.includes(todo._id);

    return hasBeenNotified && timeDiff > config.deadlineBufferTime;
  }

  async sendNotificationHandler() {
    try {
      console.log('Checking if any notifications should be sent');

      const todos = await this.getAllTodos();

      for (const todo of todos) {
        if (this.shouldSendNotification(todo)) {
          this.notifiedTodoList.push(todo._id);
          await this.sendNotification(todo);
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
