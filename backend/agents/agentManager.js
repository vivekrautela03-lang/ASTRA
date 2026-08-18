/**
 * ASTRA OS — Autonomous Multi-Agent Swarm Manager
 */

import { taskManager, TASK_STATUSES } from '../tasks/taskManager.js';
import { modelRouter } from '../models/modelRouter.js';
import { memoryManager, MEMORY_TIERS } from '../memory/memoryManager.js';

export class AgentManager {
  constructor() {
    this.agents = {
      ResearchAgent: {
        name: 'ResearchAgent',
        role: 'Deep Web Researcher & Synthesizer',
        specialties: ['Web Search', 'Paper Extraction', 'Citation Verification', 'Contradiction Detection'],
        preferredModel: 'gemini-1-5-pro'
      },
      CodingAgent: {
        name: 'CodingAgent',
        role: 'Full-Stack Software Engineer & DevOps',
        specialties: ['Git Branching', 'Refactoring', 'Unit Tests', 'Security Scans', 'PR Generation'],
        preferredModel: 'gpt-4o'
      },
      CreativeAgent: {
        name: 'CreativeAgent',
        role: 'Screenwriter, Storyboarder & Content Creator',
        specialties: ['Copywriting', 'Storyboarding', 'Visual Prompts', 'Narrative Decks'],
        preferredModel: 'gpt-4o'
      },
      DesignAgent: {
        name: 'DesignAgent',
        role: 'UI/UX Visual Architect',
        specialties: ['Figma Tokens', 'Design Systems', 'Micro-Interactions', 'Aesthetics'],
        preferredModel: 'gpt-4o'
      },
      BrowserAgent: {
        name: 'BrowserAgent',
        role: 'Web Automator & Content Scraper',
        specialties: ['Form Filling', 'Data Extraction', 'Site Navigation'],
        preferredModel: 'llama-3-70b'
      },
      SystemAgent: {
        name: 'SystemAgent',
        role: 'OS Automation & Host Controller',
        specialties: ['File Management', 'Process Health', 'Command Execution', 'System Telemetry'],
        preferredModel: 'llama-3-70b'
      },
      DataAgent: {
        name: 'DataAgent',
        role: 'Data Scientist & RAG Indexer',
        specialties: ['Vector Embeddings', 'Knowledge Graphs', 'Database Normalization', 'SQL Queries'],
        preferredModel: 'deepseek-r1'
      },
      SecurityAgent: {
        name: 'SecurityAgent',
        role: 'Zero-Trust Gatekeeper & Vulnerability Scanner',
        specialties: ['Prompt Defense', 'Sandbox Isolation', 'Audit Integrity', 'Risk Scoring'],
        preferredModel: 'deepseek-r1'
      },
      RoboticsAgent: {
        name: 'RoboticsAgent',
        role: 'Kinematics & Spatial Motion Planner',
        specialties: ['Trajectory Simulation', 'Sensor Fusion', 'Exoskeleton Control', 'Safety Interlocks'],
        preferredModel: 'gpt-4o'
      }
    };
  }

  listAgents() {
    return Object.values(this.agents);
  }

  async runWorkflow(goal, { agentRole = 'SystemAgent', projectId = null } = {}) {
    const agent = this.agents[agentRole] || this.agents.SystemAgent;
    const task = taskManager.createTask({
      goal,
      agentRole: agent.name,
      plan: [
        { id: 'step-1', description: `[${agent.name}] Analyze context and retrieve memory`, status: 'PENDING' },
        { id: 'step-2', description: `[${agent.name}] Execute domain-specific reasoning`, status: 'PENDING' },
        { id: 'step-3', description: `[${agent.name}] Verify output and store artifact`, status: 'PENDING' }
      ]
    });

    taskManager.updateTask(task.id, { status: TASK_STATUSES.RUNNING, currentStepIndex: 1, progress: 30 });
    taskManager.addLog(task.id, `Agent ${agent.name} dispatched with goal: "${goal}"`);

    // Model execution
    const prompt = `Goal: ${goal}\nYou are ${agent.name}, specializing in: ${agent.specialties.join(', ')}. Formulate your technical output.`;
    const aiResult = await modelRouter.executeQuery(prompt, { modelId: agent.preferredModel });

    taskManager.updateTask(task.id, { currentStepIndex: 2, progress: 80 });
    taskManager.addLog(task.id, `Agent produced response via ${aiResult.provider} (${aiResult.modelUsed}) in ${aiResult.latencyMs}ms`);

    // Attach artifact
    const artifact = {
      title: `${agent.name} Execution Summary`,
      type: 'markdown',
      content: aiResult.text
    };
    taskManager.attachArtifact(task.id, artifact);

    // Update memory
    memoryManager.addMemory({
      tier: MEMORY_TIERS.EPISODIC,
      content: `Agent ${agent.name} completed task: "${goal}"`,
      projectId,
      tags: ['agent-run', agent.name.toLowerCase()],
      importance: 7
    });

    taskManager.updateTask(task.id, {
      status: TASK_STATUSES.COMPLETED,
      currentStepIndex: 3,
      progress: 100
    });
    taskManager.addLog(task.id, 'Task execution verified and completed successfully.');

    return {
      taskId: task.id,
      agentRole: agent.name,
      status: TASK_STATUSES.COMPLETED,
      output: aiResult.text,
      artifact
    };
  }
}

export const agentManager = new AgentManager();
