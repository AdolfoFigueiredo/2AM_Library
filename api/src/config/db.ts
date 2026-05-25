import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306), // Fallback padrão caso falhe
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10,
});

async function testDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    connection.release();
    return true;
  } catch (error: any) {
    console.error("Erro ao conectar ao banco de dados!");
    console.error(`Detalhes do erro: ${error.message}`);
    return false;
  }
}
export { pool, testDatabaseConnection };
