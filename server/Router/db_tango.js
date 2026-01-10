import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import _ from 'lodash'

async function getTango(req, res){
    await db_connection(req, res, async(db) => {
        let { tId } = req.query;

        let hyoukis = db.data.hyouki;
        let joinHukumu = db.data.hukumu.filter( (v) => v.tId == tId ) 
            .map( (v) => {
                return {
                    ...v,
                    ...hyoukis.find( (hy) => v.hyId == hy.hyId )
                }
            })
            .filter( (v, i, arr) => arr.indexOf(v) == i )
            .map( (v) => {
                return {
                    hyouki : v.hyouki,
                    yomi : v.yomi
                }
            })
        joinHukumu = _.uniqBy(
            joinHukumu
            , 'hyouki'
        )

        res.send({
            message : 'success',
            data : {
                list : joinHukumu,
                imi : db.data.imi.filter( (v) => v.tId == tId ).map( (v) => v.koText )
            }
        })
    });
}

async function searchTangoList(req, res){
    await db_connection(req, res, async(db) => {
        let { hyouki, yomi, hyoukiQuery, yomiQuery } = req.query;

        let _td = await db_module.makeTextData(hyoukiQuery, yomiQuery)
        let _core = _td.filter( (t) => t.ruby != null ).map( (t) => t.data ).join('');

        let condition = ( _joined ) => {
            let _j_core = _joined.textData.filter( (t) => t.ruby != null).map( (t) => t.data).join('');
            
            return _j_core == _core;
        }

        let hyoukis = db.data.hyouki;
        let joinHukumu = db.data.hukumu.map( (v) => {
            return {
                ...v,
                ...hyoukis.find( (hy) => v.hyId == hy.hyId )
            }
        }).filter( (v) => 
            v.hyouki.includes(hyouki) || v.yomi.includes(yomi) ||
            condition(v)
        ).filter(
            (v, i, arr) => arr.indexOf(v) == i
        ).map( (v) => {
            return {
                hyouki : v.hyouki,
                yomi : v.yomi,
                tId : v.tId,
                hyId : v.hyId,
                hyOffset : v.hyouki.indexOf(hyouki),
                yOffset : v.yomi.indexOf(yomi)
            }
        });

        res.send({
            message : 'success',
            data :  _.unionBy(joinHukumu, 'tId')
        });
    })
}

router.get('/', getTango);
router.get('/check', searchTangoList);

export default router;