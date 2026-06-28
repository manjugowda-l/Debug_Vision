/**
 * Extension services - placeholder for future services
 */

export class ExtensionService {
  private static instance: ExtensionService;

  private constructor() {}

  public static getInstance(): ExtensionService {
    if (!ExtensionService.instance) {
      ExtensionService.instance = new ExtensionService();
    }
    return ExtensionService.instance;
  }

  public initialize(): void {
    console.log('ExtensionService initialized');
  }
}
