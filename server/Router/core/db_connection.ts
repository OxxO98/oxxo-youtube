import path from 'path';
import { Low, JSONFile } from 'lowdb';
import fs from 'fs'
import { assetPath } from './path_module.js';

//import type { Low } from 'lowdb'

import type { Request, Response } from 'express';
import type { DBData, db } from '../../types/db_types.js';

type DBCallback = (db : db) => void | Promise<void>;

const defaultData : DBData = {
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

async function db_connection(req : Request, res : Response, func : DBCallback ){

  return await (async (req, res) => {
    let db : db;
    try{
        if( !fs.existsSync(assetPath) ){
          fs.mkdirSync(assetPath, { recursive: true });
        }

        const file = path.join(assetPath, 'db', 'db.json');
        if( !fs.existsSync( path.join(assetPath, 'db') ) ){
          fs.mkdirSync( path.join(assetPath, 'db'), { recursive: true } );
        }
        if( fs.existsSync(file) == false ){
          await fs.writeFileSync(file, JSON.stringify(defaultData, null, 2) );
        }
        const adapter = new JSONFile<DBData>(file);
        db = new Low<DBData>(adapter) as db;
        
        await db.read();

        if( db == null ) return;

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
