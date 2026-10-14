export {};

declare global {
  interface Window {
    api?: {
      loadData: () => Promise<unknown>;
      saveData: (data: unknown) => Promise<boolean>;
    };
  }
}
