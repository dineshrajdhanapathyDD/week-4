/**
 * Browser-compatible entry point for the AI-driven Snake game
 * This file is designed to work directly in browsers without module systems
 */
declare global {
    interface Window {
        game: any;
        toggleGame: () => void;
        resetGame: () => void;
        toggleAIVisibility: () => void;
    }
}
export {};
//# sourceMappingURL=browser.d.ts.map