/**
 * ASTRA OS — Node-Based Workflow Engine
 */

import { agentManager } from '../agents/agentManager.js';
import { toolRegistry } from '../tools/toolRegistry.js';
import { eventBus } from '../events/eventBus.js';

export class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.initDefaultWorkflows();
  }

  initDefaultWorkflows() {
    this.registerWorkflow({
      id: 'wf-daily-standup',
      name: 'Morning Intelligence Briefing',
      trigger: { type: 'SCHEDULE', cron: '0 9 * * *' },
      steps: [
        { id: 'w1', type: 'TOOL', name: 'search_memory', args: { query: 'active projects', limit: 3 } },
        { id: 'w2', type: 'AGENT', role: 'ResearchAgent', goal: 'Synthesize morning briefing on systems and git status' },
        { id: 'w3', type: 'NOTIFICATION', title: 'Morning Briefing Ready', channel: 'DESKTOP' }
      ]
    });
  }

  registerWorkflow(workflow) {
    this.workflows.set(workflow.id, {
      ...workflow,
      createdAt: new Date().toISOString()
    });
    return workflow;
  }

  async runWorkflow(workflowId) {
    const wf = this.workflows.get(workflowId);
    if (!wf) return { success: false, error: 'Workflow not found' };

    eventBus.emit('WORKFLOW_STARTED', { workflowId: wf.id, name: wf.name });
    const results = [];

    for (const step of wf.steps) {
      if (step.type === 'TOOL') {
        const toolRes = await toolRegistry.execute(step.name, step.args);
        results.push({ stepId: step.id, type: 'TOOL', result: toolRes });
      } else if (step.type === 'AGENT') {
        const agentRes = await agentManager.runWorkflow(step.goal, { agentRole: step.role });
        results.push({ stepId: step.id, type: 'AGENT', result: agentRes });
      }
    }

    eventBus.emit('WORKFLOW_COMPLETED', { workflowId: wf.id, results });
    return { success: true, workflowId: wf.id, results };
  }

  listWorkflows() {
    return Array.from(this.workflows.values());
  }
}

export const workflowEngine = new WorkflowEngine();
