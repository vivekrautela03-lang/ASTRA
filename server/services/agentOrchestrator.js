/**
 * ASTRA OS — Autonomous Multi-Agent Orchestrator
 */

import { taskManager, TASK_STATUSES } from './taskManager.js';
import { modelRouter } from './modelRouter.js';
import { memorySystem } from './memorySystem.js';

export class AgentOrchestrator {
  constructor() {
    this.agents = {
      ResearchAgent: {
        name: 'ResearchAgent',
        role: 'Research & Verification',
        capabilities: ['Web Search', 'Paper Synthesis', 'Contradiction Checking', 'Citation Verification'],
        status: 'IDLE'
      },
      CodingAgent: {
        name: 'CodingAgent',
        role: 'Software Architecture & Code Generation',
        capabilities: ['Codebase Navigation', 'Refactoring', 'Test Runner', 'Git Branching & PRs'],
        status: 'IDLE'
      },
      CreativeAgent: {
        name: 'CreativeAgent',
        role: 'Content & Presentation Synthesis',
        capabilities: ['Slide Decks', 'Storyboards', 'Image Prompts', 'Copywriting'],
        status: 'IDLE'
      },
      SystemAgent: {
        name: 'SystemAgent',
        role: 'OS Automation & Host Telemetry',
        capabilities: ['App Launching', 'File Read/Write', 'Clipboard Ops', 'Window Control'],
        status: 'ACTIVE'
      },
      BrowserAgent: {
        name: 'BrowserAgent',
        role: 'Web Exploration & Scraping',
        capabilities: ['DOM Traversal', 'API Querying', 'Form Automation'],
        status: 'IDLE'
      },
      DataAgent: {
        name: 'DataAgent',
        role: 'Data Analysis & Mathematical Proofs',
        capabilities: ['pgvector Analytics', 'Statistical Summaries', 'Logic Trees'],
        status: 'IDLE'
      },
      RoboticsAgent: {
        name: 'RoboticsAgent',
        role: 'Kinematic & Hardware Safety Control',
        capabilities: ['Spatial Mapping', 'Trajectory Planning', 'Digital Twin Simulation', 'Interlock Guard'],
        status: 'IDLE'
      }
    };
  }

  listAgents() {
    return Object.values(this.agents);
  }

  async runWorkflow(goal, { agentRole = 'SystemAgent' } = {}) {
    const task = taskManager.createTask({
      goal,
      agentRole,
      plan: [
        'Analyze goal and query context',
        'Check memory and knowledge graph',
        'Execute specialized agent actions',
        'Synthesize findings and artifacts',
        'Verify results and report status'
      ]
    });

    taskManager.updateTask(task.id, { status: TASK_STATUSES.RUNNING, currentStepIndex: 1, progress: 20 });
    taskManager.addStepLog(task.id, `Agent ${agentRole} allocated for goal: "${goal}"`);

    // 1. Check memory for relevant context
    const relatedMemories = memorySystem.searchMemories(goal, { limit: 3 });
    const memoryContext = relatedMemories.map(m => `- ${m.content}`).join('\n');

    // 2. Delegate to Model Router
    taskManager.updateTask(task.id, { currentStepIndex: 2, progress: 50 });
    const systemPrompt = `You are ${agentRole} in ASTRA OS. Your goal: "${goal}".\nRelevant Knowledge:\n${memoryContext}`;
    const result = await modelRouter.executeQuery(goal, { systemPrompt });

    // 3. Complete and log artifacts
    taskManager.updateTask(task.id, { currentStepIndex: 4, progress: 100, status: TASK_STATUSES.COMPLETED });
    taskManager.addStepLog(task.id, `Agent completed with response latency ${result.latencyMs}ms using ${result.modelUsed}`);

    const artifact = {
      id: `art-${Date.now()}`,
      title: `${agentRole} Execution Summary`,
      type: 'markdown',
      content: result.text,
      createdAt: new Date().toISOString()
    };
    taskManager.attachArtifact(task.id, artifact);

    return {
      taskId: task.id,
      agentRole,
      result: result.text,
      modelUsed: result.modelUsed,
      artifact
    };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
