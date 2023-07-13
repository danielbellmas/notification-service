import { Todo } from '../models/todo';
import { getDateNDaysFromNow, getTodayDate } from '../utils/date';

export const todosMock: Todo[] = [
  {
    _id: '1',
    title: 'Todo 1',
    deadline: getDateNDaysFromNow(1)
  },
  {
    _id: '2',
    title: 'Todo 2',
    deadline: getDateNDaysFromNow(2)
  },
  {
    _id: '3',
    title: 'Todo 3',
    deadline: getTodayDate()
  }
];
