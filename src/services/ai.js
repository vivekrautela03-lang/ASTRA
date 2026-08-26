import { aiEngine } from './aiEngine';

export async function askAstra(prompt) {
  try {
    const response = await aiEngine.processQuery(prompt);
    return response;
  } catch (error) {
    console.error('[AI Service Error]:', error);
    return {
      text: "I encountered a synchronization error with the neural core, boss. Reconnecting...",
      model: "fallback",
      actions: []
    };
  }
}

export default {
  askAstra
};
