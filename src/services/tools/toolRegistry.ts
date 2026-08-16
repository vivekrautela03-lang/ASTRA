import { weatherTool } from './WeatherTool';
import { timeDateTool } from './TimeDateTool';
import { specialDayTool } from './SpecialDayTool';
import { cameraTool } from './CameraTool';
import { ragTool } from './RAGTool';
import { internetSearchService } from '../internetSearchService';

export interface ToolExecutionResult {
  executed: boolean;
  toolName?: string;
  resultSummary?: string;
  actionRequested?: 'open_camera' | 'close_camera' | 'show_weather' | 'show_time' | 'hide_all' | 'open_rag';
}

export class ToolRegistry {
  /**
   * Evaluate user prompt and execute tools if requested
   */
  public async evaluateAndExecute(prompt: string): Promise<ToolExecutionResult> {
    const lower = prompt.toLowerCase().trim();

    // 1. Camera Tools & UI Directives
    if (lower.includes('open camera') || lower.includes('show camera') || lower.includes('launch camera') || lower.includes('look through the camera') || lower.includes('look at this')) {
      return {
        executed: true,
        toolName: 'CameraTool',
        resultSummary: 'On it, Boss. Opening the live camera preview for you now.',
        actionRequested: 'open_camera'
      };
    }
    if (lower.includes('close camera') || lower.includes('stop camera') || lower.includes('hide camera')) {
      cameraTool.stopCamera();
      return {
        executed: true,
        toolName: 'CameraTool',
        resultSummary: 'Closing the camera now, Boss.',
        actionRequested: 'close_camera'
      };
    }

    // 2. RAG Knowledge Search Directives
    if (lower.includes('search knowledge') || lower.includes('search document') || lower.includes('search rag') || lower.includes('vector search')) {
      const query = prompt.replace(/search knowledge|search document|search rag|vector search/gi, '').trim() || 'ASTRA';
      const summary = await ragTool.search(query);
      return {
        executed: true,
        toolName: 'RAGTool',
        resultSummary: summary,
        actionRequested: 'open_rag'
      };
    }

    // 3. Weather Tool Directives
    if (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast') || lower.includes('how hot') || lower.includes('is it raining')) {
      const weatherRes = await weatherTool.execute();
      return {
        executed: true,
        toolName: 'WeatherTool',
        resultSummary: weatherRes.summary,
        actionRequested: 'show_weather'
      };
    }

    // 4. Time & Date Tool Directives
    if (lower.includes('what time is it') || lower.includes('current time') || lower.includes('clock') || lower.includes('show time')) {
      const summary = timeDateTool.execute('time');
      return {
        executed: true,
        toolName: 'TimeDateTool',
        resultSummary: summary,
        actionRequested: 'show_time'
      };
    }
    if (lower.includes('what day is today') || lower.includes('what is today') || lower.includes('today\'s day')) {
      const summary = timeDateTool.execute('day');
      return {
        executed: true,
        toolName: 'TimeDateTool',
        resultSummary: summary
      };
    }
    if (lower.includes('tomorrow\'s date') || lower.includes('what is the date') || lower.includes('today\'s date') || lower.includes('date today')) {
      const summary = timeDateTool.execute('date');
      return {
        executed: true,
        toolName: 'TimeDateTool',
        resultSummary: summary
      };
    }

    // 5. Special Day Tool Directives
    if (lower.includes('special day') || lower.includes('festival') || lower.includes('holiday') || lower.includes('event today')) {
      const summary = specialDayTool.execute();
      return {
        executed: true,
        toolName: 'SpecialDayTool',
        resultSummary: summary
      };
    }

    // 6. General UI Directives
    if (lower.includes('hide everything') || lower.includes('minimize widgets') || lower.includes('clear screen')) {
      return {
        executed: true,
        toolName: 'SystemUI',
        resultSummary: 'Hiding all desktop widgets for a clean view, Boss.',
        actionRequested: 'hide_all'
      };
    }

    // 7. Web Search Trigger
    if (internetSearchService.needsWebSearch(prompt)) {
      const searchRes = await internetSearchService.searchWeb(prompt);
      return {
        executed: true,
        toolName: 'WebSearchTool',
        resultSummary: searchRes.summary
      };
    }

    return { executed: false };
  }
}

export const toolRegistry = new ToolRegistry();
