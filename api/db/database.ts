import initSqlJs, { type Database } from "sql.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, "../../data");
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "railway.db");

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  initializeSchema(db);
  return db;
}

function initializeSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      createdAt TEXT NOT NULL,
      stepCount INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS step_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT NOT NULL REFERENCES sessions(id),
      stepIndex INTEGER NOT NULL,
      action TEXT NOT NULL,
      trainId TEXT NOT NULL,
      targetSection TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      sectionsSnapshot TEXT NOT NULL,
      yields TEXT NOT NULL DEFAULT '[]',
      cannotPass TEXT NOT NULL DEFAULT '[]'
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS trains (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      length INTEGER NOT NULL,
      priority INTEGER NOT NULL
    );
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_step_logs_session ON step_logs(sessionId, stepIndex);`);

  const result = db.exec("SELECT COUNT(*) as cnt FROM trains");
  const count = result.length > 0 && result[0].values.length > 0 ? (result[0].values[0][0] as number) : 0;

  if (count === 0) {
    db.run("INSERT INTO trains (id, name, length, priority) VALUES ('train-1', '列车 A', 3, 5)");
    db.run("INSERT INTO trains (id, name, length, priority) VALUES ('train-2', '列车 B', 2, 3)");
    db.run("INSERT INTO trains (id, name, length, priority) VALUES ('train-3', '列车 C', 4, 1)");
    db.run("INSERT INTO trains (id, name, length, priority) VALUES ('train-4', '列车 D', 2, 4)");
    db.run("INSERT INTO trains (id, name, length, priority) VALUES ('train-5', '列车 E', 3, 2)");
  }

  saveDb(db);
}

export function saveDb(database: Database): void {
  const data = database.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function closeDb(): void {
  if (db) {
    saveDb(db);
    db.close();
    db = null;
  }
}

export function queryAll(database: Database, sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const stmt = database.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: Record<string, unknown>[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}

export function queryOne(database: Database, sql: string, params: unknown[] = []): Record<string, unknown> | null {
  const results = queryAll(database, sql, params);
  return results.length > 0 ? results[0] : null;
}

export function runStatement(database: Database, sql: string, params: unknown[] = []): void {
  database.run(sql, params);
  saveDb(database);
}
