/**
 * ASTRA OS — Central API Gateway (v1 REST API)
 */

import { Router } from 'express';
import { JWTVerifier } from '../auth/jwtVerifier.js';
import { ContextEngine } from './contextEngine.js';
import { IntentEngine } from './intentEngine.js';
import { TaskPlanner } from './planner.js';
import { modelRouter } from '../models/modelRouter.js';
import { agentManager } from '../agents/agentManager.js';
import { taskManager, TASK_STATUSES } from '../tasks/taskManager.js';
import { toolRegistry } from '../tools/toolRegistry.js';
import { memoryManager, MEMORY_TIERS } from '../memory/memoryManager.js';
import { permissionEngine } from '../security/permissionEngine.js';
import { voiceSessionManager } from '../voice/voiceSessionManager.js';
import { VisionProcessor } from '../vision/visionProcessor.js';
import { workflowEngine } from '../workflows/workflowEngine.js';
import { deviceManager } from '../devices/deviceManager.js';
import { telemetryService } from '../observability/telemetry.js';
import { integrationManager } from '../integrations/integrationManager.js';
import { PublicApisCatalog } from '../integrations/publicApisCatalog.js';

export const gatewayRouter = Router();

// Apply JWT verification across all v1 routes
gatewayRouter.use(JWTVerifier.authMiddleware);

// 1. Core Status Endpoint
gatewayRouter.get('/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'ASTRA Production AI Operating System',
    version: '10.0-ultra',
    user: req.user,
    health: telemetryService.getHealth()
  });
});

// 2. Chat & Directive Execution Pipeline (Direct to Python Native Kernel)
gatewayRouter.post('/chat', async (req, res) => {
  const { prompt, modelId, projectId, screenContext } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  // Forward query directly to Python Native Backend Kernel
  try {
    const pyRes = await fetch('http://127.0.0.1:8991/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, modelId, projectId, screenContext })
    });
    if (pyRes.ok) {
      const pyData = await pyRes.json();
      return res.json({
        response: pyData.response,
        modelUsed: pyData.modelUsed || 'astra-python-native',
        provider: 'ASTRA Native Python Kernel',
        toolUsed: pyData.toolUsed,
        latencyMs: 15
      });
    }
  } catch {
    // Fallback to local model router if python bridge is restarting
  }

  // Fallback Step: Route to model router
  const systemPrompt = await ContextEngine.buildContext(prompt, { projectId, screenContext });
  const aiResult = await modelRouter.executeQuery(prompt, { modelId, systemPrompt });

  res.json({
    response: aiResult.text,
    modelUsed: aiResult.modelUsed,
    provider: aiResult.provider,
    latencyMs: aiResult.latencyMs
  });
});

// 3. Voice Session Pipeline
gatewayRouter.post('/voice/session', (req, res) => {
  const session = voiceSessionManager.createSession(req.body);
  res.json({ success: true, session });
});

// 4. Vision Frame Analysis Pipeline
gatewayRouter.post('/vision/analyze', async (req, res) => {
  const result = await VisionProcessor.analyzeFrame(req.body.image, req.body);
  res.json(result);
});

// 5. Tasks Management Endpoints
gatewayRouter.get('/tasks', (req, res) => {
  res.json({ tasks: taskManager.getAllTasks() });
});

gatewayRouter.post('/tasks', (req, res) => {
  const { goal, agentRole } = req.body;
  const planned = TaskPlanner.plan(goal, { agentRole });
  const task = taskManager.createTask({
    goal,
    agentRole: planned.agentRole,
    plan: planned.plan
  });
  res.json({ success: true, task });
});

gatewayRouter.post('/tasks/:id/run', async (req, res) => {
  const task = taskManager.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  taskManager.updateTask(task.id, { status: TASK_STATUSES.RUNNING, progress: 50 });
  res.json({ success: true, task: taskManager.getTask(req.params.id) });
});

// 6. Autonomous Agents Run Endpoint
gatewayRouter.post('/agents/run', async (req, res) => {
  const { goal, agentRole, projectId } = req.body;
  const result = await agentManager.runWorkflow(goal, { agentRole, projectId });
  res.json(result);
});

// 7. Typed Tools Execution Gateway
gatewayRouter.post('/tools/execute', async (req, res) => {
  const { toolName, args } = req.body;
  const result = await toolRegistry.execute(toolName, args, { user: req.user });
  res.json(result);
});

// 8. Workflow Engine Execution
gatewayRouter.post('/workflows/run', async (req, res) => {
  const result = await workflowEngine.runWorkflow(req.body.workflowId);
  res.json(result);
});

// 9. Memory Vault Endpoints
gatewayRouter.get('/memory', (req, res) => {
  const { query, tier, projectId } = req.query;
  const memories = memoryManager.searchMemories(query, { tier, projectId, limit: 50 });
  res.json({ memories, graph: memoryManager.getKnowledgeGraph() });
});

// 10. Devices & Robotics Endpoints
gatewayRouter.get('/devices', (req, res) => {
  res.json({ devices: deviceManager.listDevices() });
});

// 11. Integrations Endpoint
gatewayRouter.get('/integrations', (req, res) => {
  res.json({ integrations: integrationManager.getIntegrations() });
});

// 12. Security Center Endpoints
gatewayRouter.get('/security/audit', (req, res) => {
  res.json({
    pending: permissionEngine.getPendingRequests(),
    logs: permissionEngine.getAuditLogs()
  });
});

gatewayRouter.post('/security/approve', (req, res) => {
  res.json(permissionEngine.approve(req.body.id, req.user?.displayName || 'User'));
});

gatewayRouter.post('/security/reject', (req, res) => {
  res.json(permissionEngine.reject(req.body.id, req.body.reason));
});

// 13. Observability & Health
gatewayRouter.get('/observability/health', (req, res) => {
  res.json(telemetryService.getHealth());
});

// 14. Public APIs Master Catalog & Discovery Endpoints
gatewayRouter.get('/public-apis', (req, res) => {
  const { query, category } = req.query;
  res.json(PublicApisCatalog.listAll(query, category));
});

gatewayRouter.get('/public-apis/categories', (req, res) => {
  res.json({ categories: PublicApisCatalog.getCategories() });
});
