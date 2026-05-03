import { createClient, Client } from '@libsql/client';
import path from 'path';
import dotenv from 'dotenv';
import { MigrationRunner } from './migrationRunner';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export class DatabaseService {
    private client: Client;
    private db: any = null;
    private migrationRunner: MigrationRunner;

    constructor() {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url || !authToken) {
            throw new Error('Turso configuration is missing! Please check .env file.');
        }

        this.client = createClient({
            url,
            authToken
        });

        this.migrationRunner = new MigrationRunner(this.client);
    }

    async init() {
        if (!this.db) {
            // Run migrations first
            await this.migrationRunner.migrate();

            this.db = {
                sql: async (query: string, params: any[] = []) => {
                    const result = await this.client.execute({
                        sql: query,
                        args: params
                    });
                    return result.rows;
                },
                close: () => this.client.close(),
                raw: this.client
            };
        }
        return this.db;
    }

    async executeQuery(query: string, params: any[] = []) {
        if (!this.db) await this.init();
        let sqliteQuery = query;
        if (query.includes('$')) {
            let index = 1;
            while (sqliteQuery.includes(`$${index}`)) {
                sqliteQuery = sqliteQuery.replace(`$${index}`, '?');
                index++;
            }
        }
        return await this.db.sql(sqliteQuery, params.map(p => p === undefined ? null : p));
    }

    // --- Departments ---
    async getDepartments() { return this.executeQuery('SELECT * FROM departments ORDER BY name'); }
    async addDepartment(name: string, code: string) { 
        const res = await this.executeQuery('INSERT INTO departments (name, code) VALUES (?, ?) RETURNING *', [name, code]);
        return res[0];
    }

    // --- Professors ---
    async getProfessors() { return this.executeQuery('SELECT * FROM professors ORDER BY name'); }
    async addProfessor(data: any) {
        const res = await this.executeQuery('INSERT INTO professors (name, email, phone, title, academic_title) VALUES (?, ?, ?, ?, ?) RETURNING *', 
            [data.name, data.email, data.phone, data.title, data.academic_title]);
        return res[0];
    }

    // --- Assignments ---
    async getAssignments(academicYear?: string, semester?: string, specialization?: string) {
        let query = 'SELECT a.*, p.name as professor_name, c.name as course_name, r.name as room_name, g.name as group_name FROM assignments a LEFT JOIN professors p ON a.professor_id = p.id LEFT JOIN courses c ON a.course_id = c.id LEFT JOIN rooms r ON a.room_id = r.id LEFT JOIN groups g ON a.group_id = g.id';
        const conditions = [];
        const params = [];
        if (academicYear) { conditions.push(`a.academic_year = ?`); params.push(academicYear); }
        if (semester) { conditions.push(`a.semester = ?`); params.push(semester); }
        if (specialization) { conditions.push(`g.specialization = ?`); params.push(specialization); }
        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY a.day_of_week, a.start_time';
        return this.executeQuery(query, params);
    }

    // Add more methods as needed...
}

export const dbService = new DatabaseService();
