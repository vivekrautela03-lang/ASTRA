/**
 * ASTRA OS — Entity-Relationship Knowledge Graph Engine
 */

export class KnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.initDefaultGraph();
  }

  initDefaultGraph() {
    this.addNode('user:vivek', 'User', { name: 'Vivek', role: 'Architect & Boss' });
    this.addNode('project:astra', 'Project', { name: 'ASTRA OS', version: '10.0-ultra' });
    this.addNode('tech:react19', 'Technology', { name: 'React 19' });
    this.addNode('tech:supabase', 'Technology', { name: 'Supabase Postgres + pgvector' });
    this.addNode('device:primary-pc', 'Device', { name: 'Workstation Host', type: 'Desktop' });
    this.addNode('agent:coding', 'Agent', { name: 'CodingAgent', role: 'Developer' });
    this.addNode('agent:research', 'Agent', { name: 'ResearchAgent', role: 'Scholar' });
    this.addNode('agent:robotics', 'Agent', { name: 'RoboticsAgent', role: 'Hardware & Kinematics' });

    this.addEdge('user:vivek', 'project:astra', 'CREATED');
    this.addEdge('user:vivek', 'device:primary-pc', 'OWNS');
    this.addEdge('project:astra', 'tech:react19', 'DEPENDS_ON');
    this.addEdge('project:astra', 'tech:supabase', 'PERSISTS_TO');
    this.addEdge('project:astra', 'agent:coding', 'SUPERVISES');
    this.addEdge('project:astra', 'agent:research', 'SUPERVISES');
    this.addEdge('project:astra', 'agent:robotics', 'SUPERVISES');
  }

  addNode(id, type, properties = {}) {
    this.nodes.set(id, { id, type, properties, createdAt: new Date().toISOString() });
    return this.nodes.get(id);
  }

  addEdge(sourceId, targetId, relation, metadata = {}) {
    const edge = {
      id: `edge-${sourceId}-${relation}-${targetId}`,
      source: sourceId,
      target: targetId,
      relation,
      metadata,
      createdAt: new Date().toISOString()
    };
    this.edges.push(edge);
    return edge;
  }

  getNeighbors(nodeId) {
    const outgoing = this.edges.filter(e => e.source === nodeId).map(e => ({ edge: e, node: this.nodes.get(e.target) }));
    const incoming = this.edges.filter(e => e.target === nodeId).map(e => ({ edge: e, node: this.nodes.get(e.source) }));
    return { outgoing, incoming };
  }

  exportGraph() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }
}

export const knowledgeGraph = new KnowledgeGraph();
