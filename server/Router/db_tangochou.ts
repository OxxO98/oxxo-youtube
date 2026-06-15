import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import _ from 'lodash'
import { Hukumu, Hyouki, jaBun, Kanji, Komu, TextData } from "../types/db_types.js";

type TangochouList = Hyouki & {
    imi : string[]
}

type TangoInfoTangoList = Hukumu & Hyouki
type TangoList = Hukumu & jaBun

type KanjiInfoList = Komu & {
    tId : string;
    hyouki : string;
    yomi : string;
}

type PDFTangoList = Hukumu & Hyouki & jaBun & {
    imi : string;
    koText : string;
}

type PDFKanjiList = Komu & {
    imi : string;
    tId : string;
    hyouki : string;
    textData : TextData[]
    yomi : string;
}

async function getTangochou(req : RouterRequest, res : RouterResponse) {
    await db_connection(req, res, async(db) => {
        let { videoId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let uniqList : Hukumu[] = _.uniqBy(joinList, 'tId');
        let retList : TangochouList[] = uniqList.map( (v) => {
            return {
                ...db.data.hyouki.find( (hy) => v.hyId == hy.hyId ),
                imi : db.data.imi.filter( (m) => v.tId == m.tId ).map( (m) => m.koText ),
                tId : v.tId
            }
        })

        res.send({
            message : 'success',
            data : retList
        });
    });
}

async function getTangoInfo(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, tId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let tangoList : TangoInfoTangoList[] = joinList.filter( (v) => 
            v.tId == tId
        ).map( (v) => {
            return {
                ...v,
                ...db.data.hyouki.find( (hy) => hy.hyId == v.hyId )
            }
        })
        
        let uniqList : TangoInfoTangoList[] = _.uniqBy(tangoList, 'hyId'); //필요하나?

        let kanjiList : Kanji[] = uniqList.map( (v) => {
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

async function getTangoList(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, hyId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let tangoList : Hukumu[] = joinList.filter( (v) => 
            v.hyId == hyId
        )
        
        let retList : TangoList[] = tangoList.map( (v) => {
            return {
                ...v,
                ...db.data.jaBuns.find( (ja) => ja.jaBId == v.jaBId)
            }
        })

        res.send({
            message : 'success',
            data : retList
        });
    })
}

async function getKanjiInfo(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, kId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let hukumuList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let tangoList : KanjiInfoList[] = hukumuList.map( (v) => {
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

async function searchTangochou(req : RouterRequest, res : RouterResponse) {
    await db_connection(req, res, async(db) => {
        let { videoId, keyword, imiKeyword } = req.query;

        let _condition = (v) => {
            if( imiKeyword == undefined ){
                return v.yomi.includes(keyword) ||
                    keyword.includes(v.yomi) ||
                    v.hyouki.includes(keyword) ||
                    keyword.includes(v.hyouki)
            }
            else{
                return v.yomi.includes(keyword) ||
                    keyword.includes(v.yomi) ||
                    v.hyouki.includes(keyword) ||
                    keyword.includes(v.hyouki) ||
                    v.imi.filter( (m) => m.includes(imiKeyword) || imiKeyword.includes(m) ).length > 0
            }
        }

        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        let retList = joinList.map( (v) => {
            return {
                tId : v.tId,
                ...db.data.hyouki.find( (hy) => v.hyId == hy.hyId ),
                imi : db.data.imi.filter( (m) => m.tId == v.tId ).map( (m) => m.koText )
            }
        }).filter( (v) => 
            _condition(v)
        )

        res.send({
            message : 'success',
            data : _.uniqBy(retList, 'tId')
        });
    });
}

async function getToPdfTango(req : RouterRequest, res : RouterResponse){
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

        let tangoList : PDFTangoList[] = hukumuList.map( (v) => {
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

        let kanjiList : PDFKanjiList[] = tangoList.map( (v) => {
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

        let PdfTangoList : PDFTangoList[][] = _.toArray( _.groupBy(tangoList, 'tId') );
        PdfTangoList = PdfTangoList.map( (v) => _.uniqBy(v, 'hyId') );

        let PdfKanjiList : PDFKanjiList[][] = _.toArray( _.groupBy(kanjiList, 'kId') );
        PdfKanjiList = PdfKanjiList.map( (v) => _.uniqBy(v, 'hyId') );

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