import path from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetPath = path.join(__dirname, '../../Asset');

const defaultData = {
  "videos" : [],
  "jaBuns" : [],
  "koBuns" : [],
  "hukumu" : [],
  "hyouki" : [],
  "imi" : [],
  "tango" : [],
  "komu" : [],
  "kanji" : []
}

async function db_connection(req, res, func){

  return await (async (req, res) => {
    let db;
    try{
        const file = path.join(assetPath, 'db', 'db.json');
        const adapter = new JSONFile(file);
        db = new Low(adapter, defaultData);
        
        await db.read();
        await db.write();

        await func(db);

    } catch(err) {
        res.end();
        console.error(err);
    } finally {
        res.end();
    }
  })(req, res);
}

export default db_connection
