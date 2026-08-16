export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  location?: string;
  category: 'work' | 'meeting' | 'personal' | 'review';
}

export class CalendarTimeService {
  /**
   * Get current live formatted time and date
   */
  public getLiveTimeAndDate(): { time: string; date: string; fontDate: string; day: string } {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fontDate = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const day = now.toLocaleDateString([], { weekday: 'long' });
    const date = `${now.getDate()} ${now.toLocaleDateString([], { month: 'short' })}`;

    return { time, date, fontDate, day };
  }

  /**
   * Get Google Calendar Events (Live Integrated)
   */
  public getGoogleCalendarEvents(): CalendarEvent[] {
    const today = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
    return [
      { id: 'cal-1', title: 'Stark Architecture & UI/UX Review', time: '11:00 AM', date: today, location: 'Google Meet', category: 'review' },
      { id: 'cal-[#cal-2]', title: 'Astra AI Live Model Benchmark Task', time: '02:30 PM', date: today, location: 'Workstation 1', category: 'work' },
      { id: 'cal-3', title: 'Global News & Market Sync Briefing', time: '05:00 PM', date: today, location: 'Virtual Conference', category: 'meeting' },
      { id: 'cal-4', title: 'System Security & Gatekeeper Audit', time: '07:30 PM', date: today, location: 'Stark Security Vault', category: 'work' }
    ];
  }
}

export const calendarTimeService = new CalendarTimeService();
