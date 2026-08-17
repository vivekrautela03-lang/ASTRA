/**
 * ASTRA OS — Execution Sandbox & Prompt Defense Gate
 */

import { exec } from 'child_process';
import path from 'path';

const BLOCKED_PATTERNS = [
  new RegExp('rm\\s+-rf\\s+[/\\\\]', 'i'),
  /format\s+[a-z]:/i,
  /del\s+\/f\s+\/s\s+\/q\s+[a-z]:\\windows/i,
  /drop\s+database/i,
  /:(){ :|:& };:/, // Fork bomb
  /curl.*\|\s*sh/i,
  /wget.*\|\s*sh/i
];

export class ExecutionSandbox {
  constructor(workspaceRoot = process.cwd()) {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  isPathAllowed(targetPath) {
    try {
      const resolved = path.resolve(this.workspaceRoot, targetPath);
      return resolved.startsWith(this.workspaceRoot);
    } catch {
      return false;
    }
  }

  isCommandSafe(command) {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        return { safe: false, reason: `Command matches hazardous security signature: ${pattern}` };
      }
    }
    return { safe: true };
  }

  async runCommand(command, { timeoutMs = 10000, cwd = this.workspaceRoot } = {}) {
    const safetyCheck = this.isCommandSafe(command);
    if (!safetyCheck.safe) {
      return {
        success: false,
        error: safetyCheck.reason,
        stdout: '',
        stderr: safetyCheck.reason,
        exitCode: 126
      };
    }

    return new Promise((resolve) => {
      exec(command, { timeout: timeoutMs, cwd }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout: stdout || '',
          stderr: stderr || '',
          error: error ? error.message : null,
          exitCode: error?.code || 0
        });
      });
    });
  }

  defendUntrustedContent(content, sourceName = 'External Source') {
    if (!content) return '';
    // Strip potential system prompt injection sequences
    const sanitized = String(content)
      .replace(/ignore previous instructions/gi, '[filtered instruction attempt]')
      .replace(/you are now in developer mode/gi, '[filtered mode attempt]')
      .replace(/system prompt:/gi, '[filtered prompt attempt]');

    return `\n<untrusted_data source="${sourceName}">\n${sanitized}\n</untrusted_data>\n`;
  }
}

export const executionSandbox = new ExecutionSandbox();
