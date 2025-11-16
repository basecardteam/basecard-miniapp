import postgres from "postgres";
import dotenv from "dotenv";

// Load .env.local file
dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined in environment variables.");
    process.exit(1);
}

async function addTokenIdColumn() {
    const client = postgres(DATABASE_URL);

    try {
        console.log("🔄 Adding token_id column to cards table...");

        // Check if column already exists
        const checkResult = await client`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'cards' AND column_name = 'token_id'
        `;

        if (checkResult.length > 0) {
            console.log("✅ Column 'token_id' already exists in cards table");
            return;
        }

        // Add the column
        await client`
            ALTER TABLE "cards" ADD COLUMN "token_id" integer;
        `;

        console.log("✅ Successfully added 'token_id' column to cards table");
    } catch (error) {
        console.error("❌ Error adding token_id column:", error);
        throw error;
    } finally {
        await client.end();
    }
}

addTokenIdColumn()
    .then(() => {
        console.log("✅ Migration completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    });

