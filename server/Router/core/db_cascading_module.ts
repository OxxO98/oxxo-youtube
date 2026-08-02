import type {
    db, Video, YTB, jaBun, koBun, Hyouki, Hukumu, HukumuData, TextData,
    queryHyouki, queryYomi
} from '../../types/db_types.js';

import * as db_module from "./db_module.js";
import logger from "./logger.js"

async function delete_hukumu_in_ja(db : db, jaBId : string){
    let hukumus = await db_module.getHukumu(db, jaBId);

    for( let hukumu of hukumus ){
        if( await db_module.getMoreExistHyId(db, hukumu.hyId) == false ){
            console.log('더이상 쓰이지 않는 표기 : 삭제');
            logger.info( db_module.logHyoukiDelete(hukumu.hyId) );
            await db_module.deleteHyouki(db, hukumu.hyId);

            let kIds = await db_module.getKIds(db, hukumu.hyId);
            for( let kId of kIds ){
                let moreExistKanji = await db_module.getMoreExistKanji(db, hukumu.hyId, kId);
                if( !moreExistKanji ){
                    logger.info( db_module.logKanjiDelete(kId) );
                    await db_module.deleteKanji(db, kId);
                }
            }

            logger.info( db_module.logKomuDelete(hukumu.hyId) );
            await db_module.deleteKomu( db, hukumu.hyId );
        }
        if( await db_module.getMoreExistTId( db, hukumu.tId ) == false ){
            console.log('더이상 쓰이지 않는 단어 : 삭제');
            logger.info( db_module.logTangoDelete(hukumu.tId) );
            db.data.tango = db.data.tango.filter( (v) => v.tId != hukumu.tId );
        }
        console.log('HUKUMU 삭제');
        logger.info( db_module.logHukumuDelete( jaBId, hukumu.startOffset, hukumu.endOffset ) );
        await db_module.deleteHukumu( db, jaBId, hukumu.startOffset, hukumu.endOffset );
    }
}

export {
    delete_hukumu_in_ja
}