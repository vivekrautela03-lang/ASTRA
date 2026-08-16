export interface SpecialDayEvent {
  title: string;
  category: 'holiday' | 'festival' | 'national' | 'personal';
  date: string;
  description: string;
}

export class SpecialDayTool {
  public name = 'SpecialDayTool';
  public description = 'Detect festivals, national holidays, important calendar events, and special dates';

  public getSpecialDayInfo(): { currentEvent: SpecialDayEvent | null; nextEvent: SpecialDayEvent | null } {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const date = now.getDate();
    const year = now.getFullYear();

    // Calendar database including 16 August 2026 and major events
    const specialEvents: SpecialDayEvent[] = [
      { title: 'Indian Independence Day Celebration', category: 'national', date: '2026-08-15', description: 'Celebrating 79 Years of Independence' },
      { title: 'National Innovation & AI Awareness Day', category: 'festival', date: '2026-08-16', description: 'Celebrating futuristic AI achievements' },
      { title: 'World Photography & Media Day', category: 'holiday', date: '2026-08-19', description: 'Global creative art & vision day' },
      { title: 'Raksha Bandhan Festival', category: 'festival', date: '2026-08-28', description: 'Festival of bonds and protection' }
    ];

    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const currentEvent = specialEvents.find(e => e.date === todayStr) || null;
    const nextEvent = specialEvents.find(e => e.date > todayStr) || null;

    return { currentEvent, nextEvent };
  }

  public execute(): string {
    const { currentEvent, nextEvent } = this.getSpecialDayInfo();
    if (currentEvent) {
      return `Today is ${currentEvent.title}, Boss! ${currentEvent.description}.`;
    }
    if (nextEvent) {
      return `Nothing special today, Boss. The next upcoming event is ${nextEvent.title} on ${nextEvent.date}.`;
    }
    return `Nothing special today, Boss. All calendar events are clear.`;
  }
}

export const specialDayTool = new SpecialDayTool();
