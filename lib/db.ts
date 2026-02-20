import mssql from 'mssql';

const config: mssql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // For Azure, or general security
        trustServerCertificate: true, // Change to true for local dev / self-signed certs
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise: Promise<mssql.ConnectionPool> | null = null;

function getPool() {
    if (poolPromise) return poolPromise;
    poolPromise = new mssql.ConnectionPool(config).connect();
    return poolPromise;
}

export async function query(sql: string, params?: any[]) {
    try {
        const pool = await getPool();
        const request = pool.request();

        if (params) {
            params.forEach((param, index) => {
                request.input(`p${index}`, param);
                // Update sql to use @p0, @p1 style placeholders if mysql style ? was used
                sql = sql.replace('?', `@p${index}`);
            });
        }

        const result = await request.query(sql);
        // For SELECT or INSERT with OUTPUT, result.recordset contains the rows.
        // For UPDATE/DELETE/INSERT (without OUTPUT), result.rowsAffected contains the count.
        return result.recordset || result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export default getPool();
