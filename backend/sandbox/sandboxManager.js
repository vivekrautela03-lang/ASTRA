/**
 * ASTRA OS — Execution Sandbox Manager
 */

import { exec } from 'child_process';
import path from 'path';

const BLOCKED_COMMANDS = [
  new RegExp('rm\\s+-rf\\s+[/\\\\]', 'i'),
  /format\s+[a-z]:/i,
  /del\s+\/f\s+\/s\s+\/q\s+[a-z]:\\windows/i,
  /drop\s+database/i,
  /:(){ :|:& };:/, // Fork bomb
  /curl.*\|\s*sh/i,
  /wget.*\|\s*sh/i
];

export class SandboxManager {
  constructor(workspaceRoot = process.cwd()) {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  isCommandPermitted(command = '') {
    for (const pattern of BLOCKED_COMMANDS) {
      if (pattern.test(command)) {
        return { permitted: false, reason: `Command matches dangerous pattern: ${pattern}` };
      }
    }
    return { permitted: true };
  }

  async runSandboxed(command, { timeoutMs = 10000, cwd = this.workspaceRoot } = {}) {
    const check = this.isCommandPermitted(command);
    if (!check.permitted) {
      return {
        success: false,
        error: check.reason,
        stdout: '',
        stderr: check.reason,
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
}

export const sandboxManager = new SandboxManager();
