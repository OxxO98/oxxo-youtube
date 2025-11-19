
interface db {
    data : {
        videos : Video[];
        jaBuns : jaBun[];
        koBuns : koBun[];
        hukumu : Hukumu[];
        hyouki : Hyouki[];
        imi : Imi[];
        tango : Tango[];
        komu : Komu[];
        kanji : Kanji[];
    }
}

type queryHyouki = string;
type queryYomi = string;

interface Video {
    title : string;
    src : string;
    timeline : YTB[];
}

interface YTB {
    ytBId : string;
    jaBId : string;
    koBId : string | null;
    startTime : number;
    endTime : number;
}

interface jaBun {
    jaBId : string;
    jaText : string;
    ytBId : string;
}

interface koBun {
    koBId : string;
    koText : string;
    ytBId : string;
}

//Tango 관련
interface TextData {
    data : string;
    ruby : string | null;
    offset : number;
}

interface Hyouki {
    hyId : string;
    textData : Array<TextData>;
    yomi : string;
    hyouki : string;
    tId : string;
}

interface Imi {
    iId : string;
    koText : string;
    tId : string;
}

interface Tango {
    tId : string;
}

interface Komu {
    hyId : string;
    kId : string;
}

interface Kanji {
    kId : string;
    jaText : string;
}

interface Hukumu {
    jaBId : string;
    startOffset : number;
    endOffset : number;
    hyId : string; //yomi와 통합
    iId : string | null;
    tId : string;
}

//getHukumu
interface HukumuData {
    jaBId : string;
    startOffset : number;
    endOffset : number;
    hyId : string; //yomi와 통합
    iId : string | null;
    tId : string;
    //Hyouki
    textData : Array<TextData>;
    yomi : string;
    hyouki : string;
}

/*
    delete의 경우 Id(primary key)로만 제거하는 방식 
*/

//Table
async function getTimeline( db : db, videoId : string ) : Promise<YTB[] | null>{
    let timeline = db.data.videos.find( (video : Video ) => video.src == videoId )?.timeline
    if(!timeline){ return null }
    
    return timeline.sort( (a, b) => a.startTime - b.startTime );
}

async function getJaBuns( db : db ) : Promise<jaBun[]>{
    return db.data.jaBuns;
}

async function getKoBuns( db : db ) : Promise<koBun[]>{
    return db.data.koBuns;
}

//Bun

//JaBun
async function getJaBun( db : db, jaBId : string ) : Promise<jaBun | null>{
    let jaBun = db.data.jaBuns.find( (v) => v.jaBId == jaBId );
    if(!jaBun){ return null }

    return jaBun;
}

async function deleteJaBun( db : db, jaBId : string ) : Promise<void>{
    db.data.jaBuns = db.data.jaBuns.filter( (v : jaBun) => v.jaBId != jaBId );
}

//KoBun
async function getKoBun( db : db, koBId : string | null ) : Promise<koBun | null>{
    if( koBId == null ){ return null }
    let koBun = db.data.koBuns.find( (v) => v.koBId == koBId );
    if(!koBun){ return null }

    return koBun;
}

async function deleteKoBun( db : db, koBId : string ) : Promise<void>{
    db.data.koBuns = db.data.koBuns.filter( (v : koBun) => v.koBId != koBId );
}

//YTBun
async function getYTBun( timeline : YTB[], ytBId : string ) : Promise<YTB | null>{
    let ytb = timeline.find( (v) => v.ytBId == ytBId );
    if(!ytb){ return null }
    
    return ytb;
}

async function deleteYTBun( db : db, videoId : string, ytBId : string ) : Promise<void>{
    let timeline = db.data.videos.find( (video : Video) => video.src == videoId )?.timeline;
    if(!timeline){ return }

    db.data.videos.find( (video : Video) => video.src == videoId )!.timeline = timeline.filter( (v) => v.ytBId != ytBId);
}

//Tango

//Hyouki
async function getExistHyouki( db : db, hyoukiStr : string, hyouki : queryHyouki, yomi : string ) : Promise<Hyouki | null>{
    let _hyouki = db.data.hyouki
        .filter( (v : Hyouki ) => v.hyouki == hyoukiStr)
        .filter( 
            (v : Hyouki ) => {
                let dataStr = v.textData.map( (td) => td.data ).join('_');
                let rubyStr = v.textData.map( (td) => td.ruby == null ? '0' : td.ruby ).join('_');

                return dataStr == hyouki && rubyStr == yomi;
            }
        )
    if( _hyouki.length == 0 ){ return null }

    return _hyouki[0];
}

async function makeTextData( hyouki : queryHyouki, yomi : queryYomi ) : Promise<Array<TextData>>{
    let hyoukiArr = hyouki.split('_');
    let yomiArr = yomi.split('_');

    let ret :  TextData[] = [];
    let acc = 0;
    for(let i = 0; i < hyoukiArr.length; i++){
        ret.push({
            data : hyoukiArr[i],
            ruby : yomiArr[i] == '0' ? null : yomiArr[i],
            offset : acc
        })
        acc += hyoukiArr[i].length;
    }
    return ret;
}

async function updateHyouki( db : db, hyId : string, hyouki : queryHyouki, yomi : queryYomi, hyoukiStr : string, yomiStr : string ) : Promise<void>{
    let textData = await makeTextData(hyouki, yomi);

    let hy = db.data.hyouki.find( (v) => v.hyId == hyId);
    if( hy ){
        hy.textData = textData;
        hy.hyouki = hyoukiStr;
        hy.yomi = yomiStr;
    }
}

async function deleteHyouki( db : db, hyId : string ){
    db.data.hyouki = db.data.hyouki.filter( (v : Hyouki) => v.hyId != hyId);
}

//Hukumu
async function getHukumu( db : db, jaBId : string ) : Promise<HukumuData[]>{
    let hyoukis = db.data.hyouki;
    let hukumus = db.data.hukumu
        .filter( (v) => v.jaBId == jaBId)    
        .map( (v) => {
            let hyouki = hyoukis.find( (hy) => v.hyId == hy.hyId );
            if (hyouki != undefined ){
                return {
                    ...v,
                    ...hyouki
                }
            }
            else{
                return undefined;
            }
        }).filter( (v) => v != undefined )
        .sort( (a, b) => a.startOffset-b.startOffset);
        
    return hukumus;
}

async function updateHukumHyouki(db : db, jaBId : string, startOffset : number, endOffset : number, hyId : string) : Promise<void>{
    let hukumu = db.data.hukumu.find( (v) => 
        v.jaBId == jaBId && v.startOffset == startOffset && v.endOffset == endOffset
    )
    if(!hukumu){ return }

    hukumu.hyId = hyId; //업데이트가 안될 수도 있음. //안되면 filter로 해보기
}

async function deleteHukumu(db : db, jaBId : string, startOffset : number, endOffset : number) : Promise<void>{
    db.data.hukumu = db.data.hukumu.filter( (v) => 
        !(v.jaBId == jaBId &&
        v.startOffset == startOffset && v.endOffset == endOffset)
    )
}

async function getExistHukumu( db : db, jaBId : string, startOffset : number, endOffset : number) : Promise<Hukumu | null>{
    let hukumu = db.data.hukumu
        .find( (v : Hukumu ) => 
            v.jaBId == jaBId &&
            v.startOffset == startOffset && v.endOffset == endOffset
        )
    if(!hukumu ){ return null }

    return hukumu;
}

async function getMoreExistHyId( db : db, hyId : string ) : Promise<boolean>{
    let hukumu = db.data.hukumu.
        filter( (v) => 
            v.hyId == hyId
        )

    return hukumu.length > 1;
}

async function getMoreExistTId( db : db, tId : string ) : Promise<boolean>{
    let hyouki = db.data.hyouki.filter( (v) => v.tId == tId );

    return hyouki.length > 1;
}

//Kanji & Komu
async function getKanjiArr( hyouki : string ) : Promise<string[]> {
    let matched = hyouki.match(/[\u3400-\u9fff]/g);

    //한자 중복 제거.
    if( matched == null ){ return [] }
    let arrKanji = matched.filter(
        (v, i) => { return matched.indexOf(v) == i }
    );

    return arrKanji;
}

async function getKIds( db : db, hyId : string ) : Promise<string[]> {
    let kIds = db.data.komu.filter( (v) => v.hyId == hyId ).map( (v) => v.kId );

    return kIds;
}

async function getExistKId( db : db, kanji : string ) : Promise<string | null>{
    let find = db.data.kanji.find( (v) => v.jaText == kanji );

    if( find == undefined ){ return null }
    return find.kId;
}

async function getMoreExistKanji( db : db, kId : string ) : Promise<boolean>{
    // kId가 사라지면 kanji도 사라져야 하는지 확인
    let komu = db.data.komu.filter( (v) => v.kId == kId );

    return komu.length > 1;
}

async function deleteKanji( db : db, kId : string ) : Promise<void> {
    db.data.kanji = db.data.kanji.filter( (v) => v.kId != kId );
}

async function deleteKomu( db : db, hyId : string ) : Promise<void> {
    db.data.komu = db.data.komu.filter( (v) => v.hyId != hyId );
}

//Logger
function _logText( str : string ){
    return `[${str}]`;
}

function _logId( str : string | null ){
    if( str == null ){
        return `(null)`;
    }
    return `(${str})`;
}

function _logTime( time : number ){
    let _hour = Math.floor(time/3600).toString().padStart(2, '0');
    let _min = Math.floor(time/60).toString().padStart(2, '0');
    let _sec = Math.floor(time%60).toString().padStart(2, '0');
    let _msec = Math.floor(time%1*1000).toString().padStart(3, '0');

    return `[${_hour}:${_min}:${_sec}.${_msec}]`;
}

//Video
function logVideoInsert( title : string, src : string ){
    return `VIDEO 추가 TITLE ${_logText(title)} SRC ${_logText(src)}`;
}

//koBun
function logKoBunInsert( koBId : string, koText : string, ytBId : string ){
    return `KOBUN 추가 KOBID ${_logId(koBId)} KOTEXT ${_logText(koText)} YTBID ${_logId(ytBId)}`
}

function logKoBunUpdateKoText( koBun : koBun, newKoText : string ){
    return `KOBUN ${_logId(koBun.koBId)} KOTEXT 수정 ${_logText(koBun.koText)} --> ${_logText(newKoText)}`;
}

function logKoBunUpdateYtBId( koBun : koBun, newYtBId : string ){
    return `KOBUN ${_logId(koBun.koBId)} YTBID 수정 ${_logId(koBun.ytBId)} --> ${_logId(newYtBId)}`
}

function logKoBunDelete( koBId : string ){
    return `KOBUN ${_logId(koBId)} 삭제`;
}

function logKoBunDeleteYtBId( ytBId : string ){
    return `KOBUN 모든 YTBID ${_logId(ytBId)} 삭제`;
}

//jaBun
function logJaBunInsert( jaBId : string, jaText : string, ytBId : string ){
    return `JABUN 추가 JABID ${_logId(jaBId)} JATEXT ${_logText(jaText)} YTBID ${_logId(ytBId)}`
}

function logJaBunUpdateJaText( jaBun : jaBun, newJaText : string ){
    return `JABUN ${_logId(jaBun.jaBId)} JATEXT 수정 ${_logText(jaBun.jaText)} --> ${_logText(newJaText)}`
}

function logJaBunDelete( jaBId : string ){
    return `JABUN ${_logId(jaBId)} 삭제`
}

function logJaBunDeleteYtBId( ytBId : string ){
    return `JABUN 모든 YTBID ${_logId(ytBId)} 삭제`
}

//YTB
function logYTBInsert( ytBId : string, jaBId : string, startTime : number, endTime : number, koBId : string | null = null ){
    return `YTB 추가 YTB ${_logId(ytBId)} JABID ${_logId(jaBId)} KOBID ${_logId(koBId)} STARTTIME ${_logTime(startTime)} ENDTIME ${_logTime(endTime)}`
}

function logYTBUpdateKoBId( ytb : YTB, newKoBId : string | null ){
    return `YTB ${_logId(ytb.ytBId)} KOBID 수정 ${_logId(ytb.koBId)} --> ${_logId(newKoBId)}`
}

function logYTBUpdateTime( ytb : YTB, newStartTime : number, newEndTime : number ){
    return `YTB ${_logId(ytb.ytBId)} STARTTIME 수정 ${_logTime(ytb.startTime)} --> ${_logTime(newStartTime)} ENDTIME 수정 ${_logTime(ytb.endTime)} --> ${_logTime(newEndTime)}`
}

function logYTBDelete( ytBId : string ){
    return `YTB ${_logId(ytBId)} 삭제`
}

//HUKUMU
function logHukumuInsert( jaBId : string, startOffset : number, endOffset : number, hyId : string, tId : string ){
    return `HUKUMU 추가 JABID ${_logId(jaBId)} STARTOFFSET ${startOffset.toString()} ENDOFFSET ${endOffset.toString()} HYID ${_logId(hyId)} TID ${_logId(tId)}`;
}

function logHukumuUpdateIId( hukumu : Hukumu, newIId : string | null ){
    return `HUKUMU ${_logId(hukumu.jaBId)} IID 수정 ${_logId(hukumu.iId)} --> ${_logId(newIId)}`
}

function logHukumuUpdateJaBIdOffsets( hukumu : Hukumu, newJaBId : string, newStartOffset : number, newEndOffset : number ){
    return `HUKUMU ${_logId(hukumu.jaBId)} JABID 수정 ${_logId(hukumu.jaBId)} --> ${_logId(newJaBId)} STARTOFFSET 수정 ${hukumu.startOffset.toString()} --> ${newStartOffset.toString()} ENDOFFSET 수정 ${hukumu.endOffset.toString()} --> ${newEndOffset.toString()}`
}

function logHukumuUpdateOffsets( hukumu : Hukumu, newStartOffset : number, newEndOffset : number ){
    return `HUKUMU ${_logId(hukumu.jaBId)} STARTOFFSET 수정 ${hukumu.startOffset.toString()} --> ${newStartOffset.toString()} ENDOFFSET 수정 ${hukumu.endOffset.toString()} --> ${newEndOffset.toString()}`
}

function logHukumuUpdateHyId( hukumu : Hukumu, hyId : string ){
    return `HUKUMU ${_logId(hukumu.jaBId)} HYID 수정 ${_logId(hukumu.hyId)} --> ${_logId(hyId)}`
}

function logHukumuDelete( jaBId : string, startOffset : number, endOffset : number ){
    return `HUKUMU JABID ${_logId(jaBId)} STARTOFFSET ${startOffset.toString()} ENDOFFSET ${endOffset.toString()} 삭제`
}

//HYOUKI
function logHyoukiInsert( hyId : string, yomi : string, hyouki : string, tId : string ){
    return `HYOUKI 추가 HYID ${_logId(hyId)} YOMI ${_logText(yomi)} HYOUKI ${_logText(hyouki)} TID ${_logId(tId)}`
}

function logHyoukiUpdateHyoukiYomi( hy : Hyouki, hyouki : string, yomi : string ){
    return `HYOUKI ${_logId(hy.hyId)} HYOUKI 수정 ${_logText(hy.hyouki)} --> ${_logText(hyouki)} YOMI 수정 ${_logText(hy.yomi)} --> ${_logText(yomi)}`
}

function logHyoukiDelete( hyId : string ){
    return `HYOUKI ${_logId(hyId)} 삭제`
}

//imi
function logImiInsert( iId : string, koText : string, tId : string ){
    return `IMI 추가 IID ${_logId(iId)} KOTEXT ${_logText(koText)} TID ${_logId(tId)}`;
}

function logImiDelete( iId : string ){
    return `IMI ${_logId(iId)} 삭제`
}

//TANGO
function logTangoInsert( tId : string ){
    return `TANGO 추가 TID ${_logId(tId)}`
}

function logTangoDelete( tId : string ){
    return `TANGO ${_logId(tId)} 삭제`
}

//KOMU
function logKomuInsert( hyId : string, kId : string ){
    return `KOMU 추가 HYID ${_logId(hyId)} KID ${_logId(kId)}`
}

function logKomuDelete( hyId : string ){
    return `KOMU HYID ${_logId(hyId)} 삭제`
}

//KANJI
function logKanjiInsert( kId : string, jaText : string ){
    return `KANJI 추가 KID ${_logId(kId)} JATEXT ${_logId(jaText)}`
}

function logKanjiDelete( kId : string ){
    return `KANJI ${_logId(kId)} 삭제`
}

export {
    getTimeline,
    getJaBuns,
    getKoBuns,

    getJaBun,
    deleteJaBun,

    getKoBun,
    deleteKoBun,

    getYTBun,
    deleteYTBun,

    getExistHyouki,
    makeTextData,
    updateHyouki,
    deleteHyouki,

    getHukumu,
    updateHukumHyouki,
    deleteHukumu,
    getExistHukumu,
    getMoreExistHyId,
    
    getMoreExistTId,

    getKanjiArr,
    getKIds,
    getExistKId,
    getMoreExistKanji,
    deleteKanji,
    deleteKomu,

    logVideoInsert,
    logKoBunInsert,
    logKoBunUpdateKoText,
    logKoBunUpdateYtBId,
    logKoBunDelete,
    logKoBunDeleteYtBId,
    logJaBunInsert,
    logJaBunUpdateJaText,
    logJaBunDelete,
    logJaBunDeleteYtBId,
    logYTBInsert,
    logYTBUpdateKoBId,
    logYTBUpdateTime,
    logYTBDelete,
    logHukumuInsert,
    logHukumuUpdateIId,
    logHukumuUpdateJaBIdOffsets,
    logHukumuUpdateOffsets,
    logHukumuUpdateHyId,
    logHukumuDelete,
    logHyoukiInsert,
    logHyoukiUpdateHyoukiYomi,
    logHyoukiDelete,
    logImiInsert,
    logImiDelete,
    logTangoInsert,
    logTangoDelete,
    logKomuInsert,
    logKomuDelete,
    logKanjiInsert,
    logKanjiDelete
}