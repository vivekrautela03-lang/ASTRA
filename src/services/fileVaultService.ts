export type VaultFileType = 'chat' | 'image' | 'document' | 'code' | 'audio';

export interface VaultItem {
  id: string;
  name: string;
  type: VaultFileType;
  size: string;
  createdAt: string;
  timestamp: number;
  previewUrl?: string;
  content?: string;
  summary?: string;
  tags: string[];
  metadata?: {
    messagesCount?: number;
    dimensions?: string;
    model?: string;
    language?: string;
  };
}

const VAULT_STORAGE_KEY = 'astra_file_vault_v1';

class FileVaultService {
  private items: VaultItem[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.items.length === 0) {
      this.seedDefaultItems();
    }
  }

  private seedDefaultItems(): void {
    this.items = [
      {
        id: 'chat-neural-arch',
        name: 'Autonomous Multi-Agent Architecture.chat',
        type: 'chat',
        size: '14.2 KB',
        createdAt: 'Today at 10:45 AM',
        timestamp: Date.now() - 3600000,
        summary: 'Deep architectural discussion regarding decentralized event queues and subagent telemetry.',
        tags: ['Architecture', 'Agents', 'v10.0'],
        metadata: {
          messagesCount: 18,
          model: 'Claude 3.5 Sonnet'
        },
        content: `# Autonomous Multi-Agent Architecture
User: How do we coordinate specialized worker agents with zero-trust safety?
ASTRA: By deploying the Autonomous Orchestrator pattern with permission interlocks...`
      },
      {
        id: 'img-quantum-core',
        name: 'Quantum_Orb_Bioluminescence.png',
        type: 'image',
        size: '2.4 MB',
        createdAt: 'Yesterday at 04:20 PM',
        timestamp: Date.now() - 86400000,
        previewUrl: './astra-logo.jpg',
        summary: 'Synthetic 4K digital twin rendering of the ASTRA living plasma energy core.',
        tags: ['Render', 'Plasma', '4K'],
        metadata: {
          dimensions: '3840x2160',
          model: 'DALL-E 3 HD'
        }
      },
      {
        id: 'doc-kernel-specs',
        name: 'ASTRA_OS_Kernel_Specification.pdf',
        type: 'document',
        size: '418 KB',
        createdAt: '2 days ago',
        timestamp: Date.now() - 172800000,
        summary: 'Complete technical documentation on zero-trust sandboxing and host process hooks.',
        tags: ['Documentation', 'Security', 'Specs'],
        metadata: {
          language: 'English',
          model: 'PDF Engine'
        },
        content: 'ASTRA Operating System v10.0 Kernel Specifications & Sandbox Architecture.'
      },
      {
        id: 'code-shader-caustics',
        name: 'FractalCausticsShader.ts',
        type: 'code',
        size: '8.6 KB',
        createdAt: '3 days ago',
        timestamp: Date.now() - 259200000,
        summary: 'GLSL / Three.js custom shader material simulating liquid refractive glass.',
        tags: ['Three.js', 'WebGL', 'GLSL'],
        metadata: {
          language: 'TypeScript',
          model: 'GPT-4o'
        },
        content: `export const liquidCausticsFragmentShader = \`
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    gl_FragColor = vec4(0.0, 0.75, 1.0, 0.85);
  }
\`;`
      }
    ];
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(VAULT_STORAGE_KEY);
      if (data) {
        this.items = JSON.parse(data);
      }
    } catch {
      this.items = [];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // ignore
    }
  }

  public getItems(): VaultItem[] {
    this.loadFromStorage();
    return [...this.items];
  }

  public saveChatSession(title: string, messages: any[], model = 'ASTRA Neural'): VaultItem {
    const formattedContent = messages
      .map((m) => `### ${m.sender === 'user' ? 'USER' : 'ASTRA'} (${m.timestamp || ''}):\n${m.text}\n`)
      .join('\n');

    const newItem: VaultItem = {
      id: `chat-${Date.now()}`,
      name: `${title.slice(0, 36).replace(/[/\\?%*:|"<>]/g, '') || 'Conversation'}.chat`,
      type: 'chat',
      size: `${(new Blob([formattedContent]).size / 1024).toFixed(1)} KB`,
      createdAt: 'Just now',
      timestamp: Date.now(),
      summary: messages[0]?.text?.slice(0, 100) || 'Archived conversation session.',
      tags: ['Saved Chat', model],
      metadata: {
        messagesCount: messages.length,
        model
      },
      content: formattedContent
    };

    this.items.unshift(newItem);
    this.saveToStorage();
    return newItem;
  }

  public addUploadedFile(file: File, contentText?: string, previewUrl?: string): VaultItem {
    let type: VaultFileType = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.name.endsWith('.ts') || file.name.endsWith('.js') || file.name.endsWith('.py') || file.name.endsWith('.json') || file.name.endsWith('.css')) {
      type = 'code';
    }

    const newItem: VaultItem = {
      id: `file-${Date.now()}`,
      name: file.name,
      type,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      createdAt: 'Just now',
      timestamp: Date.now(),
      previewUrl,
      content: contentText || `Uploaded file: ${file.name} (${file.type})`,
      summary: `Uploaded ${file.type || 'document'} ready for ASTRA neural analysis.`,
      tags: [type.toUpperCase(), 'Uploaded'],
      metadata: {
        language: file.name.split('.').pop()
      }
    };

    this.items.unshift(newItem);
    this.saveToStorage();
    return newItem;
  }

  public deleteItem(id: string): void {
    this.items = this.items.filter((i) => i.id !== id);
    this.saveToStorage();
  }
}

export const fileVaultService = new FileVaultService();
