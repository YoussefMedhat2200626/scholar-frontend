import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export interface JobItem {
  id: number | string;
  source?: string;
  source_job_id?: string;
  title: string;
  company?: string;
  location?: string;
  url: string;
  canonical_url?: string;
  salary?: string;
  job_type?: string;
  tags_json?: string;
  is_remote?: number | boolean;
  original_source?: string;
  content_hash?: string;
  send_status?: string;
  first_seen_at?: string;
  last_seen_at?: string;
  last_checked_at?: string;
  is_taken?: boolean;
}

const getJsonDbPath = () => path.join(process.cwd(), 'jobs_export.json');

const globalForPg = global as unknown as { pgPool?: Pool };

function getPool(): Pool {
  if (!globalForPg.pgPool) {
    let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (connectionString && connectionString.includes('sslmode=require')) {
      connectionString = connectionString.replace('sslmode=require', 'sslmode=verify-full');
    }
    globalForPg.pgPool = new Pool({
      connectionString,
      ssl: connectionString?.includes('sslmode=') || connectionString?.includes('prisma')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return globalForPg.pgPool;
}

export async function getJobs(): Promise<JobItem[]> {
  const isLocalJsonMode = process.env.USE_LOCAL_JSON_DB === 'true';
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  if (isLocalJsonMode) {
    try {
      const dbPath = getJsonDbPath();
      if (!fs.existsSync(dbPath)) {
        return [];
      }
      const rawData = await fs.promises.readFile(dbPath, 'utf-8');
      const jobs: JobItem[] = JSON.parse(rawData);

      const availableJobs = jobs.filter((job) => {
        if (job.is_taken) return false;
        const seenDate = job.last_seen_at || job.first_seen_at;
        if (seenDate && seenDate < thirtyDaysAgo) return false;
        return true;
      });

      availableJobs.sort((a, b) => {
        const timeA = a.first_seen_at ? new Date(a.first_seen_at).getTime() : 0;
        const timeB = b.first_seen_at ? new Date(b.first_seen_at).getTime() : 0;
        return timeB - timeA;
      });

      return availableJobs;
    } catch (err) {
      console.error('Error reading local JSON database:', err);
      throw err;
    }
  }

  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM jobs
     WHERE (is_taken = false OR is_taken IS NULL)
       AND COALESCE(NULLIF(last_seen_at, ''), NULLIF(first_seen_at, ''))::timestamptz >= $1::timestamptz
     ORDER BY first_seen_at DESC`,
    [thirtyDaysAgo]
  );
  return rows as JobItem[];
}

export async function markJobAsTaken(id: number | string): Promise<{ success: boolean; message: string }> {
  const isLocalJsonMode = process.env.USE_LOCAL_JSON_DB === 'true';
  const now = new Date().toISOString();

  if (isLocalJsonMode) {
    const dbPath = getJsonDbPath();
    if (!fs.existsSync(dbPath)) {
      throw new Error('Local JSON database file not found');
    }

    const rawData = await fs.promises.readFile(dbPath, 'utf-8');
    const jobs: JobItem[] = JSON.parse(rawData);

    const targetJob = jobs.find((job) => String(job.id) === String(id));
    if (targetJob) {
      targetJob.is_taken = true;
      targetJob.last_checked_at = now;
      await fs.promises.writeFile(dbPath, JSON.stringify(jobs, null, 4), 'utf-8');
    }

    return { success: true, message: 'Job marked as taken locally' };
  }

  const pool = getPool();
  await pool.query(
    `UPDATE jobs SET is_taken = true, last_checked_at = $1 WHERE id = $2`,
    [now, id]
  );
  return { success: true, message: 'Job marked as taken in database' };
}
