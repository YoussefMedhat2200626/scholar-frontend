import {config} from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
import { defineConfig, env } from "prisma/config";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, ".env") });
config();

export default defineConfig({
    schema: "./src/db/prisma",
    migrations: {
        path: "./src/db/prisma/migrations",
    },
    datasource: {
        url: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
    }
});
