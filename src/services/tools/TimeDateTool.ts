export interface TimeDateData {
  time: string;
  day: string;
  date: number;
  month: string;
  year: number;
  fullDate: string;
}

export class TimeDateTool {
  public name = 'TimeDateTool';
  public description = 'Get current local time, day, date, month, and year from user system timezone';

  public getCurrentTimeDate(): TimeDateData {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const day = now.toLocaleDateString([], { weekday: 'long' });
    const date = now.getDate();
    const month = now.toLocaleDateString([], { month: 'long' });
    const year = now.getFullYear();
    const fullDate = `${day}, ${date} ${month} ${year}`;

    return { time, day, date, month, year, fullDate };
  }

  public execute(queryType: 'time' | 'day' | 'date' | 'full' = 'full'): string {
    const info = this.getCurrentTimeDate();
    if (queryType === 'time') return `The current time is ${info.time}, Boss.`;
    if (queryType === 'day') return `Today is ${info.day}, Boss.`;
    if (queryType === 'date') return `Today's date is ${info.fullDate}, Boss.`;
    return `It is ${info.time} on ${info.fullDate}, Boss.`;
  }
}

export const timeDateTool = new TimeDateTool();
