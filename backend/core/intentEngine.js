/**
 * ASTRA OS — Fast Intent Engine & Semantic Classifier
 */

export class IntentEngine {
  static classify(prompt = '') {
    const lower = prompt.toLowerCase().trim();

    // 1. App Launching Intent
    if (lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('start app ')) {
      const target = prompt.replace(/^(open|launch|start app)\s+/i, '').trim();
      return { intent: 'APP_LAUNCH', target, confidence: 0.99 };
    }

    // 2. Music & Media Playback Intent
    if (lower.startsWith('play ') || lower.startsWith('play song ')) {
      const songQuery = prompt.replace(/^(play song|play)\s+/i, '').trim();
      return { intent: 'PLAY_MEDIA', query: songQuery, confidence: 0.98 };
    }

    // 3. Audio & Volume Control
    if (lower.includes('mute') || lower.includes('volume up') || lower.includes('volume down') || lower.includes('increase volume') || lower.includes('decrease volume')) {
      let level = 'mute';
      if (lower.includes('up') || lower.includes('increase')) level = 'up';
      if (lower.includes('down') || lower.includes('decrease')) level = 'down';
      return { intent: 'VOLUME_CONTROL', level, confidence: 0.99 };
    }

    // 4. File Read/Write Operations
    if (lower.startsWith('read file ') || lower.startsWith('read ')) {
      const filePath = prompt.replace(/^(read file|read)\s+/i, '').trim();
      return { intent: 'FILE_READ', filePath, confidence: 0.95 };
    }
    if (lower.startsWith('write to file ') || lower.startsWith('save file ') || lower.startsWith('create file ')) {
      const parts = prompt.split(/ content | with content | :/i);
      const filePath = parts[0].replace(/^(write to file|save file|create file)\s+/i, '').trim();
      const content = parts[1] || '';
      return { intent: 'FILE_WRITE', filePath, content, confidence: 0.95 };
    }

    // 5. Memory Management Directives
    if (lower.startsWith('remember ') || lower.startsWith('remember that ') || lower.startsWith('remember this:')) {
      const content = prompt.replace(/^(remember that|remember this:|remember)\s+/i, '').trim();
      return { intent: 'MEMORY_REMEMBER', content, confidence: 0.99 };
    }
    if (lower.startsWith('forget ') || lower.startsWith('delete memory about ')) {
      const query = prompt.replace(/^(forget that|delete memory about|forget)\s+/i, '').trim();
      return { intent: 'MEMORY_FORGET', query, confidence: 0.99 };
    }

    // 6. Robotics & Suit Directives
    if (lower.includes('robot') || lower.includes('exoskeleton') || lower.includes('suit status') || lower.includes('climbing') || lower.includes('emergency stop') || lower.includes('e-stop')) {
      return { intent: 'ROBOTICS_COMMAND', confidence: 0.96 };
    }

    // 7. Coding & Self-Development Tasks
    if (lower.includes('fix my website') || lower.includes('refactor') || lower.includes('inspect project') || lower.includes('run tests') || lower.includes('create pr')) {
      return { intent: 'CODING_WORKFLOW', confidence: 0.97 };
    }

    // 8. Deep Research Tasks
    if (lower.startsWith('research ') || lower.includes('technical report') || lower.includes('compare materials')) {
      return { intent: 'RESEARCH_WORKFLOW', confidence: 0.98 };
    }

    // 9. Conversational Chat Default
    return { intent: 'CONVERSATIONAL_CHAT', confidence: 0.95 };
  }
}
