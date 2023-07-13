export const getDateNDaysFromNow = (n: number): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  date.setDate(date.getDate() + n);
  return date;
};

export const getTomorrowDate = (): Date => getDateNDaysFromNow(1);

export const getTodayDate = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  return date;
};
