/**
 * ASTRA OS — Prompt Injection Defense & Untrusted Content Framing Gate
 */

export class PromptDefense {
  static wrapUntrusted(content, sourceName = 'External Source') {
    if (!content) return '';
    const clean = String(content)
      .replace(/ignore previous instructions/gi, '[DEFENSE: Filtered instruction attempt]')
      .replace(/you are now in developer mode/gi, '[DEFENSE: Filtered mode attempt]')
      .replace(/system prompt:/gi, '[DEFENSE: Filtered prompt attempt]')
      .replace(/system override/gi, '[DEFENSE: Filtered override attempt]');

    return `\n<untrusted_external_data source="${sourceName}">\n${clean}\n</untrusted_external_data>\n`;
  }
}
