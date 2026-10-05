require('dotenv').config();
const db = require('./src/backend-core/config/db');

async function run() {
    try {
        const res = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'contenidos_cms';");
        console.log(res.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
