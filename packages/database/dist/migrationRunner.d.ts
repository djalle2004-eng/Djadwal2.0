import { Client } from '@libsql/client';
export interface Migration {
    id: number;
    name: string;
    hash: string;
    applied_at: string;
}
export declare class MigrationRunner {
    private client;
    private migrationsDir;
    constructor(client: Client, migrationsDir?: string);
    init(): Promise<void>;
    private getMigrationFiles;
    private calculateHash;
    getStatus(): Promise<{
        name: string;
        applied: boolean;
        hashMatch: boolean | null;
    }[]>;
    migrate(dryRun?: boolean): Promise<void>;
    rollback(): Promise<void>;
}
