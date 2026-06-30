/**
 * AI Provider Interface
 *
 * Every AI provider (Ollama, Gemini, OpenAI, Claude, etc.)
 * must implement this interface.
 */

export interface AIProvider {
  /**
   * Sends a prompt to the AI model.
   * Returns the generated response.
   */
  generateResponse(prompt: string): Promise<string>;

  /**
   * Returns the provider name.
   */
  getProviderName(): string;

  /**
   * Checks whether the provider is ready.
   */
  isAvailable(): Promise<boolean>;
}