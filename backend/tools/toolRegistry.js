/**
 * ASTRA OS — Typed Tool Catalog & Tool Execution Registry
 */

import { ComputerController } from '../computer/computerController.js';
import { sandboxManager } from '../sandbox/sandboxManager.js';
import { memoryManager } from '../memory/memoryManager.js';
import { permissionEngine, PERMISSION_LEVELS } from '../security/permissionEngine.js';
import { roboticsController } from '../robotics/roboticsController.js';

export class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.registerBuiltins();
  }

  registerTool({ name, description, permissionLevel = PERMISSION_LEVELS.READ, handler }) {
    this.tools.set(name, { name, description, permissionLevel, handler });
  }

  registerBuiltins() {
    // 1. App Launching Tool
    this.registerTool({
      name: 'launch_app',
      description: 'Launch approved local desktop application',
      permissionLevel: PERMISSION_LEVELS.SAFE_ACTION,
      handler: async (args) => ComputerController.openApplication(args.appName)
    });

    // 2. File Reading Tool
    this.registerTool({
      name: 'read_file',
      description: 'Read file content from approved workspace',
      permissionLevel: PERMISSION_LEVELS.READ,
      handler: async (args) => ComputerController.readFile(args.filePath)
    });

    // 3. File Writing Tool
    this.registerTool({
      name: 'write_file',
      description: 'Write or modify file content',
      permissionLevel: PERMISSION_LEVELS.WRITE,
      handler: async (args) => ComputerController.writeFile(args.filePath, args.content)
    });

    // 4. Active Window Text Typing Tool
    this.registerTool({
      name: 'type_text',
      description: 'Send keystrokes to active window',
      permissionLevel: PERMISSION_LEVELS.SAFE_ACTION,
      handler: async (args) => ComputerController.typeTextIntoActiveWindow(args.text)
    });

    // 5. Volume Adjustment Tool
    this.registerTool({
      name: 'adjust_volume',
      description: 'Adjust host system audio volume',
      permissionLevel: PERMISSION_LEVELS.SAFE_ACTION,
      handler: async (args) => ComputerController.adjustVolume(args.level)
    });

    // 6. Sandboxed Shell Command Execution
    this.registerTool({
      name: 'execute_sandbox_cmd',
      description: 'Run shell command inside isolated execution sandbox',
      permissionLevel: PERMISSION_LEVELS.EXECUTE,
      handler: async (args) => sandboxManager.runSandboxed(args.command, { timeoutMs: args.timeoutMs })
    });

    // 7. Memory Search Tool
    this.registerTool({
      name: 'search_memory',
      description: 'Search hierarchical memory vault',
      permissionLevel: PERMISSION_LEVELS.READ,
      handler: async (args) => memoryManager.searchMemories(args.query, { tier: args.tier, limit: args.limit })
    });

    // 8. Memory Store Tool
    this.registerTool({
      name: 'store_memory',
      description: 'Store new memory node',
      permissionLevel: PERMISSION_LEVELS.WRITE,
      handler: async (args) => memoryManager.addMemory(args)
    });

    // 9. Robotics Telemetry Tool
    this.registerTool({
      name: 'robotics_get_state',
      description: 'Read physical robot joint angles and telemetry',
      permissionLevel: PERMISSION_LEVELS.READ,
      handler: async () => roboticsController.getState()
    });

    // 10. Robotics Kinematics Motion Tool
    this.registerTool({
      name: 'robotics_request_motion',
      description: 'Submit trajectory goal to safety interlock',
      permissionLevel: PERMISSION_LEVELS.PHYSICAL,
      handler: async (args) => roboticsController.requestMotion(args.goal)
    });

    // 11. Robotics Emergency Stop Tool
    this.registerTool({
      name: 'robotics_emergency_stop',
      description: 'Immediate hardware cutoff latch',
      permissionLevel: PERMISSION_LEVELS.PHYSICAL,
      handler: async () => roboticsController.emergencyStop()
    });
  }

  async execute(toolName, args = {}, { agentId = 'ASTRA-Kernel', user = { id: 'usr-vivek-owner' } } = {}) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { success: false, error: `Tool "${toolName}" not registered` };
    }

    // Permission Evaluation
    const auth = permissionEngine.requestApproval({
      actionType: tool.permissionLevel,
      target: toolName,
      metadata: args,
      agentId,
      user
    });

    if (auth.status === 'PENDING') {
      return {
        status: 'NEEDS_APPROVAL',
        message: `Tool "${toolName}" requires explicit user confirmation.`,
        approvalId: auth.id
      };
    }

    try {
      const result = await tool.handler(args);
      return { success: true, toolName, result };
    } catch (err) {
      return { success: false, toolName, error: err.message };
    }
  }

  listTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      permissionLevel: t.permissionLevel
    }));
  }
}

export const toolRegistry = new ToolRegistry();
