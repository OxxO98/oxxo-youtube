import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import _ from 'lodash'

import { nanoid } from "nanoid";

async function getTangochou(req, res) {
    await db_connection(req, res, async(db) => {
        let { videoId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let uniqList = _.uniqBy(joinList, 'tId');
        let retList = uniqList.map( (v) => {
            return {
                ...db.data.hyouki.find( (hy) => v.hyId == hy.hyId ),
                tId : v.tId
            }
        })

        res.send({
            message : 'success',
            data : retList
        });
    });
}

async function getTangoInfo(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, tId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let tangoList = joinList.filter( (v) => 
            v.tId == tId
        ).map( (v) => {
            return {
                ...v,
                ...db.data.hyouki.find( (hy) => hy.hyId == v.hyId )
            }
        })
        
        let uniqList = _.uniqBy(tangoList, 'hyId'); //필요하나?

        let kanjiList = uniqList.map( (v) => {
            let kanji = db.data.komu.filter( (km) => km.hyId == v.hyId);
            return kanji;
        }).flat().map( (v) => {
            return {
                ...db.data.kanji.find( (k) => k.kId == v.kId )
            }
        });

        let ret = {
            tangoList : uniqList,
            kanjiList : kanjiList
        }

        res.send({
            message : 'success',
            data : ret
        });
    })
}

async function getTangoList(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, hyId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let tangoList = joinList.filter( (v) => 
            v.hyId == hyId
        )
        
        tangoList = tangoList.map( (v) => {
            return {
                ...v,
                ...db.data.jaBuns.find( (ja) => ja.jaBId == v.jaBId)
            }
        })

        res.send({
            message : 'success',
            data : tangoList
        });
    })
}

async function getKanjiInfo(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, kId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let hukumuList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let tangoList = hukumuList.map( (v) => {
            return {
                ...v,
                ...db.data.hyouki.find( (hy) => hy.hyId == v.hyId )
            }
        }).map( (v) => {
            let kanji = db.data.komu.filter( (km) => km.hyId == v.hyId);
            return kanji.map( (k) => {
                return {
                    ...k,
                    tId : v.tId,
                    hyouki : v.hyouki,
                    yomi : v.yomi,
                }
            })
        }).flat().filter( (v) => 
            v.kId == kId
        ).map( (v) => {
            return {
                ...v,
                ...db.data.kanji.find( (k) => k.kId == kId )
            }
        });

        tangoList = _.uniqBy(tangoList, 'tId');

        let ret = {
            kanji : db.data.kanji.find( (v) => v.kId == kId ),
            tangoList : tangoList
        }

        res.send({
            message : 'success',
            data : ret
        });
    })
}

async function searchTangochou(req, res) {
    await db_connection(req, res, async(db) => {
        let { videoId, keyword } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        //let uniqList = _.uniqBy(joinList, 'tId');
        let retList = joinList.map( (v) => {
            return {
                tId : v.tId,
                ...db.data.hyouki.find( (hy) => v.hyId == hy.hyId )
            }
        }).filter( (v) => 
            v.yomi.includes(keyword) ||
            keyword.includes(v.yomi) ||
            v.hyouki.includes(keyword) ||
            keyword.includes(v.hyouki)
        )

        res.send({
            message : 'success',
            data : _.uniqBy(retList, 'tId')
        });
    });
}

async function getToPdfTango(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let hukumuList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        // hukumuList = _.uniqBy(hukumuList, 'tId');

        let koBuns = timeline.map( (v) => {
            let koBun = db.data.koBuns.find( (ko) => ko.koBId == v.koBId );
            if( koBun != undefined ){
                return {
                    jaBId : v.jaBId,
                    ...koBun
                }
            }
            else{
                return undefined
            }
        })
        koBuns = _.compact(koBuns);

        let tangoList = hukumuList.map( (v) => {
            let imi = v.iId != null ?
                db.data.imi.find( (i) => i.iId == v.iId ).koText : '';
            let jaBun = db.data.jaBuns.find( (ja) => ja.jaBId == v.jaBId);
            let koText = koBuns.find( (ko) => ko.jaBId == v.jaBId )?.koText ?? '';
            return {
                ...v,
                ...db.data.hyouki.find( (hy) => hy.hyId == v.hyId ),
                ...jaBun,
                imi : imi,
                koText : koText
            }
        })

        let kanjiList = tangoList.map( (v) => {
            let kanji = db.data.komu.filter( (km) => km.hyId == v.hyId );
            return kanji.map( (k) => {
                return {
                    ...k,
                    imi : v.imi,
                    tId : v.tId,
                    hyouki : v.hyouki,
                    textData : v.textData,
                    yomi : v.yomi
                }
            })
        }).flat().map( (v) => {
            return {
                ...v,
                ...db.data.kanji.find( (k) => v.kId == k.kId )
            }
        });

        tangoList = _.toArray( _.groupBy(tangoList, 'tId') );
        tangoList = tangoList.map( (v) => _.uniqBy(v, 'hyId') );

        kanjiList = _.toArray( _.groupBy(kanjiList, 'kId') );
        kanjiList = kanjiList.map( (v) => _.uniqBy(v, 'hyId') );

        let ret = {
            tangoList : tangoList,
            kanjiList : kanjiList
        }

        res.send({
            message : 'success',
            data : ret
        });
    });
}

router.get('/', getTangochou);

router.get('/tango/info', getTangoInfo);
router.get('/tango/list', getTangoList);

router.get('/kanji/info', getKanjiInfo);

router.get('/search', searchTangochou);

router.get('/pdf', getToPdfTango)

export default router;