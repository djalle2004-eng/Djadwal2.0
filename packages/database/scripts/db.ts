import { createClient } from '@libsql/client';
import { MigrationRunner } from '../src/migrationRunner';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '../../.env') });

async function main() {
    const command = process.argv[2];
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error('❌ Database configuration missing.');
        process.exit(1);
    }

    const client = createClient({ url, authToken });
    const runner = new MigrationRunner(client);

    try {
        switch (command) {
            case 'migrate':
                await runner.migrate();
                break;
            case 'rollback':
                await runner.rollback();
                break;
            case 'status':
                const status = await runner.getStatus();
                console.table(status);
                break;
            default:
                console.log('Usage: db [migrate|rollback|status]');
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        client.close();
    }
}

main();
