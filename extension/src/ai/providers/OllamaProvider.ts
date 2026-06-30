import axios from "axios";
import { AIProvider } from "../AIProvider";

/**
 * Ollama AI Provider
 */
export class OllamaProvider implements AIProvider {
  private readonly baseUrl = "http://127.0.0.1:11434";
  private readonly model = "qwen2.5:3b";

  public async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false
        }
      );

      return response.data.response;
    } catch (error) {
      console.error(error);

      return "Unable to connect to Ollama. Make sure Ollama is running.";
    }
  }

  public getProviderName(): string {
    return "Ollama";
  }

  public async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/tags`);
      return true;
    } catch {
      return false;
    }
  }
}