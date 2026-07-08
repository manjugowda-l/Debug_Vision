import * as vscode from "vscode";
import { AIProvider } from "./AIProvider";
import { PromptBuilder } from "./PromptBuilder";
import { LoggerService } from "../services/LoggerService";
import { OllamaProvider } from "./providers/OllamaProvider";

export interface ExplanationResponse {
  explanation: string;
  why: string;
  fix: string;
  example: string;
  bestPractice: string;
}

export interface FixResponse {
  canFix: boolean;
  confidence: number;
  fixedCode: string;
  reason: string;
}
/**
 * Central AI service for DebugVision.
 */
export class AIService {
  private static instance: AIService;

  private readonly logger = LoggerService.getInstance();
  private readonly promptBuilder = new PromptBuilder();

  private provider: AIProvider;

  private constructor() {
    this.provider = new OllamaProvider();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }

    return AIService.instance;
  }

  public setProvider(provider: AIProvider): void {
    this.provider = provider;

    this.logger.info(
      `AI Provider selected: ${provider.getProviderName()}`
    );
  }

  public getProvider(): AIProvider | undefined {
    return this.provider;
  }

  public hasProvider(): boolean {
    return true;
  }

  /**
   * Existing project analysis.
   */
  public async analyzeCurrentFile(): Promise<string> {
    const prompt = this.promptBuilder.buildDebugPrompt();

    this.logger.info("Sending prompt to AI...");

    const response = await this.provider.generateResponse(prompt);

    this.logger.info("AI response received.");

    return response;
  }

  /**
   * Explains one diagnostic.
   */
  public async explainDiagnostic(
    diagnostic: vscode.Diagnostic
): Promise<ExplanationResponse>{

    const prompt =
      this.promptBuilder.buildExplanationPrompt(diagnostic);

    this.logger.info("🤖 DebugVision AI is analyzing your code...");

    const response =
  await this.provider.generateResponse(prompt);

this.logger.info("Explanation generated.");

try {

    const clean = response
        .replace(/^```json/i, "")
        .replace(/^```/i, "")
        .replace(/```$/i, "")
        .trim();

    return JSON.parse(clean) as ExplanationResponse;

} catch {

    throw new Error(
        "AI returned invalid explanation JSON."
    );

}
}

public async chatAboutDiagnostic(
  diagnostic: vscode.Diagnostic,
  question: string
): Promise<string> {

  const prompt =
    this.promptBuilder.buildChatPrompt(
      diagnostic,
      question
    );

  this.logger.info("Generating chat response...");
  this.logger.info(prompt);
  this.logger.info(prompt);
  const response =
    await this.provider.generateResponse(prompt);

  this.logger.info("Chat response generated.");

  return response.trim();
}


public async chatAboutWorkspace(
    diagnostics: vscode.Diagnostic[],
    question: string
): Promise<string> {

    const prompt =
        this.promptBuilder.buildWorkspaceChatPrompt(
            diagnostics,
            question
        );

    this.logger.info(
        "Generating workspace chat response..."
    );

    const response =
        await this.provider.generateResponse(prompt);

    this.logger.info(
        "Workspace chat response generated."
    );

    return response;
}

  /**
 * Generates a fixed version of the current file.
 */
/**
 * Generates an AI fix.
 */
public async generateFix(
  diagnostic: vscode.Diagnostic
): Promise<FixResponse> {

  const prompt =
    this.promptBuilder.buildFixPrompt(diagnostic);

  this.logger.info("Generating AI fix...");

  const response =
    await this.provider.generateResponse(prompt);

  this.logger.info("AI fix generated.");

  try {

    const clean = response
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    return JSON.parse(clean) as FixResponse;

  } catch {

    return {
      canFix: false,
      confidence: 0,
      fixedCode: "",
      reason: "AI returned an invalid response."
    };

  }
}

public stopGeneration(): void {

  if (
    this.provider instanceof OllamaProvider
  ) {

    this.provider.stopGeneration();

    this.logger.info(
      "Generation stopped."
    );

  }

}
}