/**
 * ASTRA OS — Abstract AI Provider Interface
 */

export class AIProvider {
  constructor(name, providerType) {
    this.name = name;
    this.providerType = providerType;
  }

  isConfigured() {
    throw new Error('isConfigured() must be implemented by subclass');
  }

  async generateText(_prompt, _options = {}) {
    throw new Error('generateText() must be implemented by subclass');
  }
}
