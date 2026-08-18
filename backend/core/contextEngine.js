/**
 * ASTRA OS — Cognitive Context Engine
 * Synthesizes 15-Layer Memory, Project State, and Environmental Telemetry into Model Context
 */

import { memoryManager, MEMORY_TIERS } from '../memory/memoryManager.js';
import { PromptDefense } from '../security/promptDefense.js';

export class ContextEngine {
  static async buildContext(prompt, { projectId = null, searchContext = '', screenContext = '' } = {}) {
    // 1. Retrieve user preferences
    const preferences = memoryManager.searchMemories('', { tier: MEMORY_TIERS.PREFERENCE, limit: 3 });
    const prefBlock = preferences.map(p => `- ${p.content}`).join('\n');

    // 2. Retrieve relevant semantic & episodic memories for prompt
    const semanticMemories = memoryManager.searchMemories(prompt, { limit: 4 });
    const semanticBlock = semanticMemories.map(m => `- [${m.tier}] ${m.content}`).join('\n');

    // 3. Retrieve project memory if applicable
    let projectBlock = '';
    if (projectId) {
      const projectMemories = memoryManager.searchMemories('', { tier: MEMORY_TIERS.PROJECT, projectId, limit: 3 });
      projectBlock = projectMemories.map(m => `- ${m.content}`).join('\n');
    }

    // 4. Retrieve environmental memory
    const env = memoryManager.getEnvironmentalMemory();
    const working = memoryManager.getWorkingContext();

    // 5. Compose system prompt matrix
    const systemInstructions = [
      `You are ASTRA, a production-grade personal AI operating system (JARVIS/FRIDAY class).`,
      `Tone: Intelligent, calm, confident, helpful, slightly futuristic. Address Vivek as boss when appropriate.`,
      `Current Time: ${new Date().toLocaleString()} (${env.timezone})`,
      `Environment: Location: ${env.location} | Weather: ${env.weather} | Active Window: ${env.activeWindow}`,
      prefBlock ? `\n### User Preferences:\n${prefBlock}` : '',
      semanticBlock ? `\n### Relevant Knowledge & Memory:\n${semanticBlock}` : '',
      projectBlock ? `\n### Active Project Context:\n${projectBlock}` : '',
      working.activeGoal ? `\n### Current Task Goal:\n${working.activeGoal}` : '',
      searchContext ? `\n### Web / External Research (Untrusted Data):\n${PromptDefense.wrapUntrusted(searchContext, 'WebSearch')}` : '',
      screenContext ? `\n### Screen / Visual Perception:\n${screenContext}` : ''
    ].filter(Boolean).join('\n');

    return systemInstructions;
  }
}
