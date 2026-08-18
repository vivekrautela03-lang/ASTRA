/**
 * ASTRA OS — Task Engine & State Machine
 * 
 * Lifecycle:
 * QUEUED -> PLANNING -> RUNNING -> WAITING -> NEEDS_APPROVAL -> VERIFYING -> COMPLETED
 * Failures: FAILED -> RETRY / CANCEL / ROLLED_BACK
 */

export const TASK_STATUSES = {
  QUEUED: 'QUEUED',
  PLANNING: 'PLANNING',
  RUNNING: 'RUNNING',
  WAITING: 'WAITING',
  NEEDS_APPROVAL: 'NEEDS_APPROVAL',
  VERIFYING: 'VERIFYING',
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
      goal: 'Rebuild ASTRA into complete production-grade personal AI OS',
      agentRole: 'CodingAgent',
      plan: [
        { id: 's1', description: 'Inspect existing repository & audit all vectors', status: 'COMPLETED' },
        { id: 's2', description: 'Construct Layer A Custom Modular Backend in /backend', status: 'RUNNING' },
        { id: 's3', description: 'Construct Layer B Supabase pgvector database schema', status: 'PENDING' },
        { id: 's4', description: 'Run full verification & subsystem diagnostic tests', status: 'PENDING' }
      ]
    });
    this.updateTask(t1.id, {
      status: TASK_STATUSES.RUNNING,
      currentStepIndex: 1,
      progress: 60,
      logs: ['Audit verified', 'Layer A Backend constructing', 'Pipeline active']
    });
  }

  createTask({ goal, agentRole = 'SystemAgent', plan = [], tools = [] }) {
    const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const task = {
      id,
      goal,
      agentRole,
      status: TASK_STATUSES.QUEUED,
      plan: Array.isArray(plan) ? plan.map((p, idx) => typeof p === 'string' ? { id: `step-${idx+1}`, description: p, status: 'PENDING' } : p) : [],
      currentStepIndex: 0,
      progress: 0,
      tools,
      logs: [`[${new Date().toLocaleTimeString()}] Task initialized: "${goal}"`],
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

  addLog(id, logMessage) {
    const task = this.tasks.get(id);
    if (!task) return;
    task.logs.push(`[${new Date().toLocaleTimeString()}] ${logMessage}`);
    task.updatedAt = new Date().toISOString();
  }

  attachArtifact(id, artifact) {
    const task = this.tasks.get(id);
    if (!task) return;
    task.artifacts.push({
      id: `art-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...artifact
    });
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
