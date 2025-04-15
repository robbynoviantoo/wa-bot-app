// src/api/index.d.ts

declare module '../api' {
    export function getMenu(groupWaId: string): Promise<{ commands: string[] }>;
    export function setResponse(params: { groupWaId: string; command: string; response: string }): Promise<void>;
    export function addCommand(groupWaId: string, command: string): Promise<void>;
    export function removeCommand(groupWaId: string, command: string): Promise<void>;
  }
  