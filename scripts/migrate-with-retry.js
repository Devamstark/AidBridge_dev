import { execSync } from 'child_process';

/**
 * Intelligent DB Migration Script
 * Handles Neon cold starts and advisory lock timeouts on Vercel
 */
async function runMigration() {
    console.log('🚀 Starting intelligent database migration check...');

    const maxRetries = 3;
    let attempt = 1;

    while (attempt <= maxRetries) {
        try {
            console.log(`📡 Attempt ${attempt}: Deploying migrations...`);
            // Use a longer timeout for the advisory lock if possible via env, 
            // but prisma migrate deploy doesn't have a direct timeout flag.
            // We rely on the command itself.
            execSync('npx prisma migrate deploy', { stdio: 'inherit' });
            console.log('✅ Migration successful!');
            return;
        } catch (error) {
            console.warn(`⚠️ Attempt ${attempt} failed.`);

            if (attempt < maxRetries) {
                const delay = attempt * 5000; // 5s, 10s...
                console.log(`😴 Waiting ${delay / 1000}s for DB to stabilize/release locks...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;
            } else {
                console.error('❌ All migration attempts failed. Check your DATABASE_URL or DB status.');
                // We don't exit with 0 because we WANT the build to fail if migrations are broken,
                // but this retry logic handles the "transient lock" issue.
                process.exit(1);
            }
        }
    }
}

runMigration();
