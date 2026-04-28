declare module 'node-cron' {
  export interface ScheduledTask {
    start(): void;
    stop(): void;
    destroy(): void;
  }
  export function schedule(expression: string, callback: () => void | Promise<void>): ScheduledTask;
  const cron: { schedule: typeof schedule };
  export default cron;
}
