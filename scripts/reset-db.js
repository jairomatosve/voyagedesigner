import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected to DB, dropping public schema...");

        // Drop the entire public schema and recreate it.
        // This wipes all tables, types, and policies so Drizzle has a blank slate.
        await client.query('DROP SCHEMA public CASCADE;');
        await client.query('CREATE SCHEMA public;');
        await client.query('GRANT ALL ON SCHEMA public TO postgres;');
        await client.query('GRANT ALL ON SCHEMA public TO public;');

        console.log("Schema public recreated successfully.");
    } catch (err) {
        console.error("Error resetting schema:", err);
    } finally {
        await client.end();
    }
}

run();
