import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import _ from 'lodash'

async function getTango(req, res){
    await db_connection(req, res, async(db) => {
        let { tId } = req.query;

        let hyoukis = db.data.hyouki;
        let joinHukumu = _.uniqBy(
                db.data.hukumu
                .filter( (v) => v.tId == tId )
            , 'tId')
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

        res.send({
            message : 'success',
            data : {
                list : joinHukumu,
                imi : db.data.imi.filter( (v) => v.tId == tId ).map( (v) => v.koText )
            }
        })
    });
}

//중복제거에서 오류가 있을 수도 있음..
async function searchTangoList(req, res){
    await db_connection(req, res, async(db) => {
        let { hyouki, yomi } = req.query;

        let hyoukis = db.data.hyouki;
        let joinHukumu = db.data.hukumu.map( (v) => {
            return {
                ...v,
                ...hyoukis.find( (hy) => v.hyId == hy.hyId )
            }
        }).filter( (v) => 
            v.hyouki.includes(hyouki) || v.yomi.includes(yomi)
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