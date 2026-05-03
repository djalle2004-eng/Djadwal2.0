"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunner = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class MigrationRunner {
    constructor(client, migrationsDir) {
        this.client = client;
        this.migrationsDir = migrationsDir || path_1.default.join(__dirname, '../migrations');
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
        `, args: []
        });
    }
    getMigrationFiles() {
        if (!fs_1.default.existsSync(this.migrationsDir))
            return [];
        return fs_1.default.readdirSync(this.migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();
    }
    calculateHash(content) {
        return crypto_1.default.createHash('md5').update(content).digest('hex');
    }
    async getStatus() {
        await this.init();
        const applied = await this.client.execute({
            sql: 'SELECT name, hash FROM schema_migrations ORDER BY id ASC',
            args: []
        });
        const files = this.getMigrationFiles();
        const status = files.map(file => {
            const isApplied = (applied.rows || []).find(r => r.name === file);
            let hashMatch = null;
            if (isApplied) {
                const content = fs_1.default.readFileSync(path_1.default.join(this.migrationsDir, file), 'utf8');
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
            const content = fs_1.default.readFileSync(path_1.default.join(this.migrationsDir, m.name), 'utf8');
            const hash = this.calculateHash(content);
            if (dryRun) {
                console.log(`[DRY RUN] Would run migration: ${m.name}`);
                continue;
            }
            try {
                const statements = content.split(';').map(s => s.trim()).filter(s => s.length > 0);
                const batch = statements.map(s => ({ sql: s, args: [] }));
                batch.push({
                    sql: 'INSERT INTO schema_migrations (name, hash) VALUES (?, ?)',
                    args: [m.name, hash]
                });
                await this.client.batch(batch, 'write');
                console.log(`✅ Applied migration: ${m.name}`);
            }
            catch (error) {
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
        const migration = last.rows[0];
        console.log(`⏪ Rolling back migration: ${migration.name}`);
        await this.client.execute({
            sql: 'DELETE FROM schema_migrations WHERE id = ?',
            args: [migration.id]
        });
        console.log(`⚠️ Metadata for ${migration.name} removed. Please manually undo schema changes if necessary.`);
    }
}
exports.MigrationRunner = MigrationRunner;
