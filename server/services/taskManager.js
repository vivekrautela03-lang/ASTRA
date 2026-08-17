/**
 * ASTRA OS — Persistent Task Engine & Step Tracker
 */

export const TASK_STATUSES = {
  QUEUED: 'QUEUED',
  PLANNING: 'PLANNING',
  RUNNING: 'RUNNING',
  WAITING: 'WAITING',
  NEEDS_APPROVAL: 'NEEDS_APPROVAL',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  ROLLED_BACK: 'ROLLED_BACK'
};

export class TaskManager {
  constructor() {
    this.tasks = new Map();
    this.initDefaultTasks();
  }

  initDefaultTasks() {
    const t1 = this.createTask({
      goal: 'Transform ASTRA codebase into production-grade personal AI OS',
      agentRole: 'CodingAgent',
      plan: [
        'Inspect existing repository & create architecture audit',
        'Create isolated migration branch astra-ultra',
        'Implement ModelRouter & zero-trust permission engine',
        'Implement Agent Orchestrator & Multi-Device Robotics layer',
        'Run full test suite and verification'
      ]
    });
    this.updateTask(t1.id, {
      status: TASK_STATUSES.RUNNING,
      currentStepIndex: 3,
      progress: 80,
      logs: ['Audit complete', 'Branch astra-ultra active', 'Services initialized']
    });
  }

  createTask({ goal, agentRole = 'SystemAgent', plan = [], tools = [] }) {
    const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const task = {
      id,
      goal,
      agentRole,
      status: TASK_STATUSES.QUEUED,
      plan: plan.map((desc, i) => ({ id: `step-${i+1}`, description: desc, status: 'PENDING' })),
      currentStepIndex: 0,
      progress: 0,
      tools,
      logs: [`Task initialized: "${goal}"`],
      artifacts: [],
      approvalRequest: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, task);
    return task;
  }

  updateTask(id, updates) {
    const task = this.tasks.get(id);
    if (!task) return null;

    Object.assign(task, updates, { updatedAt: new Date().toISOString() });
    return task;
  }

  addStepLog(id, logMessage) {
    const task = this.tasks.get(id);
    if (!task) return;
    task.logs.push(`[${new Date().toLocaleTimeString()}] ${logMessage}`);
    task.updatedAt = new Date().toISOString();
  }

  attachArtifact(id, artifact) {
    const task = this.tasks.get(id);
    if (!task) return;
    task.artifacts.push(artifact);
    task.updatedAt = new Date().toISOString();
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  getAllTasks() {
    return Array.from(this.tasks.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

export const taskManager = new TaskManager();
