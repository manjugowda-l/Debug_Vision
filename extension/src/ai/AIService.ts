import { AIProvider } from "./AIProvider";
import { PromptBuilder } from "./PromptBuilder";
import { LoggerService } from "../services/LoggerService";
import { OllamaProvider } from "./providers/OllamaProvider";
/**
 * Central AI service for DebugVision.
 *
 * Responsible for:
 * - Building prompts
 * - Talking to an AI provider
 * - Returning AI responses
 */
export class AIService {
  private static instance: AIService;

  private readonly logger = LoggerService.getInstance();
  private readonly promptBuilder = new PromptBuilder();

  private provider: AIProvider ;

  private constructor() {
  this.provider = new OllamaProvider();
}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }

    return AIService.instance;
  }

  /**
   * Sets the active AI provider.
   */
  public setProvider(provider: AIProvider): void {
    this.provider = provider;

    this.logger.info(
      `AI Provider selected: ${provider.getProviderName()}`
    );
  }

  /**
   * Returns the current provider.
   */
  public getProvider(): AIProvider | undefined {
    return this.provider;
  }

  /**
   * Checks whether an AI provider has been configured.
   */
  public hasProvider(): boolean {
    return true;
}
  /**
   * Sends the current workspace context to the AI.
   */
  public async analyzeCurrentFile(): Promise<string> {
    

    const prompt = this.promptBuilder.buildDebugPrompt();

    this.logger.info("Sending prompt to AI...");

    const response = await this.provider.generateResponse(prompt);

    this.logger.info("AI response received.");

    return response;
  }
}