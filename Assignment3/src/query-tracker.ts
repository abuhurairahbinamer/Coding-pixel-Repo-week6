import { Logger } from "typeorm";

export class TrackingLogger implements Logger {
  public queries: string[] = [];
  public isTracking: boolean = false;
  public verbose: boolean = false;

  startTracking(verbose: boolean = false): void {
    this.queries = [];
    this.isTracking = true;
    this.verbose = verbose;
  }

  stopTracking(): string[] {
    this.isTracking = false;
    return [...this.queries];
  }

  getQueryCount(): number {
    return this.queries.length;
  }

  logQuery(query: string, parameters?: unknown[]): void {
    if (this.isTracking) {
      this.queries.push(query);
      if (this.verbose) {
        console.log(`[SQL Query #${this.queries.length}] ${query}`);
        if (parameters && parameters.length > 0) {
          console.log(`  Parameters: ${JSON.stringify(parameters)}`);
        }
      }
    }
  }

  logQueryError(error: string | Error, query: string, parameters?: unknown[]): void {
    console.error(`[SQL Error] ${error} | Query: ${query}`, parameters);
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    console.warn(`[Slow Query (${time}ms)] ${query}`, parameters);
  }

  logSchemaBuild(message: string): void {
    // schema build logs
  }

  logMigration(message: string): void {
    // migration logs
  }

  log(level: "log" | "info" | "warn", message: unknown): void {
    // general logs
  }
}

export const queryTracker = new TrackingLogger();
