import { Router } from 'express';
import { modelRouter } from '../services/modelRouter.js';
import { agentOrchestrator } from '../services/agentOrchestrator.js';
import { taskManager } from '../services/taskManager.js';
import { memorySystem } from '../services/memorySystem.js';
import { permissionEngine } from '../services/permissionEngine.js';
import { executionSandbox } from '../services/sandbox.js';
import { knowledgeGraph } from '../services/knowledgeGraph.js';

const router = Router();

// 1. Overall ASTRA System Status
router.get('/astra/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    version: '10.0-ultra',
    timestamp: new Date().toISOString(),
    models: modelRouter.listModels(),
    agents: agentOrchestrator.listAgents(),
    activeTasks: taskManager.getAllTasks().filter(t => t.status === 'RUNNING').length,
    pendingAuthorizations: permissionEngine.getPendingRequests().length
  });
});

// 2. Models Listing
router.get('/settings/models', (req, res) => {
  res.json({ models: modelRouter.listModels() });
});

// 3. Cognitive Chat & Intent Dispatch
router.post('/astra/chat', async (req, res) => {
  const { prompt, modelId, systemPrompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt parameter required' });

  try {
    const result = await modelRouter.executeQuery(prompt, { modelId, systemPrompt });
    
    // Auto-save to memory
    memorySystem.addMemory({
      content: `User: ${prompt} | ASTRA: ${result.text.slice(0, 200)}...`,
      category: 'SHORT_TERM',
      tags: ['chat-turn']
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Multi-Agent Task Run
router.post('/agents/run', async (req, res) => {
  const { goal, agentRole } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required' });

  try {
    const result = await agentOrchestrator.runWorkflow(goal, { agentRole });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agents', (req, res) => {
  res.json({ agents: agentOrchestrator.listAgents() });
});

// 5. Tasks Management
router.get('/tasks', (req, res) => {
  res.json({ tasks: taskManager.getAllTasks() });
});

router.post('/tasks', (req, res) => {
  const { goal, agentRole, plan, tools } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal required' });
  const task = taskManager.createTask({ goal, agentRole, plan, tools });
  res.json(task);
});

router.patch('/tasks/:id', (req, res) => {
  const updated = taskManager.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

// 6. Memory Endpoints
router.get('/memory', (req, res) => {
  const { q, category } = req.query;
  const list = memorySystem.searchMemories(q, { category });
  res.json({ memories: list });
});

router.post('/memory', (req, res) => {
  const { content, category, tags, importance } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const mem = memorySystem.addMemory({ content, category, tags, importance });
  res.json(mem);
});

router.delete('/memory/:id', (req, res) => {
  const result = memorySystem.deleteMemory(req.params.id);
  res.json(result);
});

// 7. Security & Audit
router.get('/security/audit', (req, res) => {
  res.json({
    auditLogs: permissionEngine.getAuditLogs(),
    pendingRequests: permissionEngine.getPendingRequests()
  });
});

router.post('/security/approve', (req, res) => {
  const { id } = req.body;
  const result = permissionEngine.approve(id);
  res.json(result);
});

router.post('/security/reject', (req, res) => {
  const { id, reason } = req.body;
  const result = permissionEngine.reject(id, reason);
  res.json(result);
});

// 8. Sandboxed Code Execution
router.post('/astra/execute', async (req, res) => {
  const { command, timeoutMs } = req.body;
  if (!command) return res.status(400).json({ error: 'Command required' });

  const auth = permissionEngine.requestApproval({
    actionType: PERMISSION_LEVELS.EXECUTE,
    target: command,
    agentId: 'CodingAgent'
  });

  if (auth.status === 'PENDING') {
    return res.status(403).json({
      status: 'NEEDS_APPROVAL',
      message: 'Command requires explicit user confirmation.',
      approvalId: auth.id
    });
  }

  const execResult = await executionSandbox.runCommand(command, { timeoutMs });
  res.json(execResult);
});

// 9. Knowledge Graph
router.get('/graph', (req, res) => {
  res.json(knowledgeGraph.exportGraph());
});

export default router;
