import express from 'express';
const app = express();

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import cors from 'cors';
import bodyParser from 'body-parser';

import api_ai from './Router/api_ai.js';
import api_yts from './Router/api_youtube_stream.js';

import api_db from './Router/api_db.js';
import db_bun from './Router/db_bun.js';
import db_translate from './Router/db_translate.js';
import db_hukumu from './Router/db_hukumu.js';
import db_tango from './Router/db_tango.js';
import db_imi from './Router/db_imi.js';
import db_list from './Router/db_list.js';
import db_tangochou from './Router/db_tangochou.js';

import db_integrity from './Router/db_integrity.js';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use('/Asset', express.static( path.join(__dirname, 'Asset') ));

app.use("/ai", api_ai);
app.use("/yts", api_yts);

app.use("/db", api_db);
app.use("/db/bun", db_bun);
app.use("/db/hukumu", db_hukumu);
app.use("/db/translate", db_translate);
app.use("/db/tango", db_tango);
app.use("/db/imi", db_imi);
app.use("/db/list", db_list);
app.use("/db/tangochou", db_tangochou);

app.use("/db/integrity", db_integrity);

const port = 5000;

app.listen(port, () => console.log(`${port}`));