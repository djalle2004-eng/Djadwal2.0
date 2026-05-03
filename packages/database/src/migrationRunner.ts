import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Client, InStatement } from '@libsql/client';

export interface Migration {
    id: number;
    name: string;
    hash: string;
    applied_at: string;
}

export class MigrationRunner {
    private client: Client;
    private migrationsDir: string;

    constructor(client: Client, migrationsDir?: string) {
        this.client = client;
        this.migrationsDir = migrationsDir || path.join(__dirname, '../migrations');
    }

    async init() {
        await this.client.execute({
            sql: `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                hash TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, args: [] });
    }

    private getMigrationFiles(): string[] {
        if (!fs.existsSync(this.migrationsDir)) return [];
        return fs.readdirSync(this.migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();
    }

    private calculateHash(content: string): string {
        return crypto.createHash('md5').update(content).digest('hex');
    }

    async getStatus() {
        await this.init();
        const applied = await this.client.execute({
            sql: 'SELECT name, hash FROM schema_migrations ORDER BY id ASC',
            args: []
        });
        
        const files = this.getMigrationFiles();
        
        const status = files.map(file => {
            const isApplied = (applied.rows || []).find(r => r.name === file) as any;
            let hashMatch = null;
            if (isApplied) {
                const content = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');
                hashMatch = isApplied.hash === this.calculateHash(content);
            }
            return {
                name: file,
                applied: !!isApplied,
                hashMatch
            };
        });

        return status;
    }

    async migrate(dryRun = false) {
        await this.init();
        const status = await this.getStatus();
        const pending = status.filter(s => !s.applied);

        if (pending.length === 0) {
            console.log('✅ No pending migrations.');
            return;
        }

        console.log(`🚀 Running ${pending.length} pending migrations...`);

        for (const m of pending) {
            const content = fs.readFileSync(path.join(this.migrationsDir, m.name), 'utf8');
            const hash = this.calculateHash(content);

            if (dryRun) {
                console.log(`[DRY RUN] Would run migration: ${m.name}`);
                continue;
            }

            try {
                const statements = content.split(';').map(s => s.trim()).filter(s => s.length > 0);
                
                const batch: InStatement[] = statements.map(s => ({ sql: s, args: [] }));
                batch.push({
                    sql: 'INSERT INTO schema_migrations (name, hash) VALUES (?, ?)',
                    args: [m.name, hash]
                });

                await this.client.batch(batch, 'write');
                console.log(`✅ Applied migration: ${m.name}`);
            } catch (error: any) {
                console.error(`❌ Failed to apply migration ${m.name}:`, error.message);
                throw error;
            }
        }
    }

    async rollback() {
        await this.init();
        const last = await this.client.execute({
            sql: 'SELECT * FROM schema_migrations ORDER BY id DESC LIMIT 1',
            args: []
        });
        if (!last.rows || last.rows.length === 0) {
            console.log('⚠️ Nothing to rollback.');
            return;
        }

        const migration = last.rows[0] as any;
        console.log(`⏪ Rolling back migration: ${migration.name}`);
        
        await this.client.execute({
            sql: 'DELETE FROM schema_migrations WHERE id = ?',
            args: [migration.id]
        });
        console.log(`⚠️ Metadata for ${migration.name} removed. Please manually undo schema changes if necessary.`);
    }
}
