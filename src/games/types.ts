export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  path: string;
  comingSoon?: boolean;
  loadPuzzle: (date: string) => Promise<unknown>;
}

