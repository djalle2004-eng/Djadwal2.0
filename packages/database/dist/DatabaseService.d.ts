export declare class DatabaseService {
    private client;
    private db;
    private migrationRunner;
    constructor();
    init(): Promise<any>;
    executeQuery(query: string, params?: any[]): Promise<any>;
    getDepartments(): Promise<any>;
    addDepartment(name: string, code: string): Promise<any>;
    getProfessors(): Promise<any>;
    addProfessor(data: any): Promise<any>;
    getAssignments(academicYear?: string, semester?: string, specialization?: string): Promise<any>;
}
export declare const dbService: DatabaseService;
