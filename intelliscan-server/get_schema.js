const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    
    db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        
        const schema = rows.map(row => `-- Table: ${row.name}\n${row.sql};\n`).join('\n');
        fs.writeFileSync('./parsed_schema.sql', schema, 'utf8');
        console.log('Schema successfully written to parsed_schema.sql');
        db.close();
    });
});
