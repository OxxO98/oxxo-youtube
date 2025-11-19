import path from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';
import fs, { mkdir } from 'fs'

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
        if( !fs.existsSync( path.join(assetPath, 'db') ) ){
          await fs.mkdirSync( path.join(assetPath, 'db') );
        }
        if( fs.existsSync(file) == false ){
          await fs.writeFileSync(file, JSON.stringify(defaultData, null, 2) );
        }
        const adapter = new JSONFile(file);
        db = new Low(adapter);
        
        await db.read();

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
