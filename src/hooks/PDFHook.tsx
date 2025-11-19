import { useState } from 'react';

import { jsPDF, TextOptionsLight } from 'jspdf';

//Font
import { jaBold, jaNorm } from 'fonts/jaText';
import { koLight, koBold, koNorm } from 'fonts/koText';

interface pos {
    x : number;
    y : number;
}

function usePDF(){

    const MARGIN = 40;

    const FONT_SIZE = 18;
    const TAB_SIZE = 36;
    const PRIMARY_COLOR = '#d7000b';
    const BALCK_COLOR = '#000000';

    const MARGIN_LINE = FONT_SIZE/4;
    const MARGIN_MIN = 4;

    const GLYPH_DOT = '';
    const GLYPH_ARROW = '⇒';

    const JATEXT_OPTION : TextOptionsLight = { lineHeightFactor : 1, baseline : 'top' };

    //State
    const [pdf, setPdf] = useState<jsPDF | null>(null);

    //Handle
    const _getLength = ( str : string, fontSize : number = FONT_SIZE  ) => {
        let isEng = new RegExp(`[a-zA-Z0-9]+`, 'g')
        let matched = str.matchAll(isEng);

        if(matched === null){
            return str.length*fontSize;
        }
        let matchedLength = [...matched].reduce( (acc, cur) => acc + cur[0].length, 0);

        return str.length*fontSize - matchedLength*(fontSize/1.75)
    }

    const isNextPage = (doc : jsPDF, lastPos : pos, list : RES_PDF_TANGO_LIST, fontSize : number = FONT_SIZE ) => {
        let maxHeight = doc.internal.pageSize.height;

        let _height = getTangoHeight(lastPos, list, fontSize);
        
        if( maxHeight - MARGIN <= lastPos.y + _height ){
            doc.addPage();
            return { x : MARGIN, y : MARGIN }
        }
        else{
            return lastPos;
        }
    }

    const getTangoHeight = ( lastPos : pos, list : RES_PDF_TANGO_LIST, fontSize : number = FONT_SIZE ) => {
        let _height = 0;

        let otherHyoukiHeight = fontSize - 6;
        let jaBunHeight = fontSize - 6;
        let koBunHeight = fontSize - 8;

        _height += fontSize*1.5 + MARGIN_MIN; //단어 헤더
        _height += MARGIN_LINE; //라인

        if(list.length > 1){ _height += otherHyoukiHeight*1.5 + MARGIN_MIN } //다른 표기

        for( let bun of list ){
            _height += jaBunHeight*1.5 + MARGIN_MIN; //일본어 예문
            if(bun.koText !== ''){ _height += koBunHeight + MARGIN_MIN } //한국어 예문
        }
        
        return _height;
    }

        //kanjiTest
    const isNextPageKanji = (doc : jsPDF, lastPos : pos, list : RES_PDF_KANJI_LIST, fontSize : number = FONT_SIZE ) => {
        let maxHeight = doc.internal.pageSize.height;

        let _height = fontSize*1.5;
        let _x = fontSize*3 + MARGIN_MIN*2;

        let maxWidth = doc.internal.pageSize.width - MARGIN;

        for( let data of list ){
            if( _x + data.hyouki.length*fontSize > maxWidth ){
                _height += fontSize*1.5 + MARGIN_MIN;
                _x = fontSize*3 + MARGIN_MIN*2;
            }
            else{
                _x += data.hyouki.length*fontSize;
            }
        }

        _height = Math.max( fontSize*3 + MARGIN_MIN*2, _height );

        if( maxHeight - MARGIN <= lastPos.y + _height ){
            doc.addPage();
            return { x : MARGIN, y : MARGIN }
        }
        else{
            return lastPos;
        }
    }

    const makeTextData = ( doc : jsPDF, lastPos : pos, textData : TextData[], fontSize : number = FONT_SIZE ) => {
        let { x, y } = lastPos;

        let rubySize = fontSize/2;

        doc.setFont('jaNorm');

        //맨처음 보정은 들어가지 않은 상태
        let _x = x;
        for( let v of textData ){
            if(v.ruby !== null){
                let _rx = _x + (v.data.length*2 - v.ruby.length )/ 2 * rubySize;
                doc.setFontSize(rubySize);
                doc.text(v.ruby, _rx, y, JATEXT_OPTION);
            }
            doc.setFontSize(fontSize);
            doc.text(v.data, _x, y+rubySize, JATEXT_OPTION);
            _x += v.data.length * fontSize;
        }

        return { x : _x, y : y + rubySize + fontSize + MARGIN_MIN }
    }

    const makeLine = ( doc : jsPDF, lastPos : pos ) => {
        let _lastPos = lastPos;

        doc.setLineWidth(0.2);
        doc.line(_lastPos.x, _lastPos.y, doc.internal.pageSize.width - MARGIN, _lastPos.y);

        return { x : _lastPos.x, y : _lastPos.y + MARGIN_LINE };
    }

    const makeJaBun = ( doc : jsPDF, lastPos : pos, data : RES_PDF_TANGO_DATA, fontSize : number = FONT_SIZE ) => {
        
        let { x, y } = lastPos;
        
        doc.setFont('jaNorm');
        doc.setFontSize(fontSize);

        let _x = x;
        let _y = y + fontSize/2;

        // dot
        doc.text( GLYPH_DOT, _x - fontSize - MARGIN_MIN, _y, JATEXT_OPTION);

        let begin = data.jaText.substring(0, data.startOffset);
        let hyouki = data.jaText.substring(data.startOffset, data.endOffset);
        let last = data.jaText.substring(data.endOffset);

        if( begin !== '' ){
            doc.text( begin, _x, _y, JATEXT_OPTION );
            // _x += begin.length * fontSize;
            _x += _getLength(begin, fontSize);
        }

        doc.setTextColor(PRIMARY_COLOR);
        makeTextData(doc, { x : _x, y : y }, data.textData, fontSize);
        doc.setTextColor(BALCK_COLOR);

        _x += hyouki.length * fontSize;
        if( last !== ''){
            doc.text( last, _x, _y, JATEXT_OPTION);
            // _x += last.length * fontSize;
            _x += _getLength(last, fontSize);
        }

        return { x : _x, y : y + fontSize*1.5 + MARGIN_MIN }
    }

    const makeKoBun = ( doc : jsPDF, lastPos : pos, data : RES_PDF_TANGO_DATA, fontSize : number = FONT_SIZE ) => {
        let { x, y } = lastPos;

        doc.setFont('koLight');
        doc.setFontSize(fontSize);

        if( data.koText !== '' ){
            let _x = x;

            doc.text( data.koText, _x, y, JATEXT_OPTION );
            _x += data.koText.length;
            return { x : _x, y : y + fontSize + MARGIN_MIN }
        }
        else{
            return lastPos;
        }
    }
    
    const makeOtherHyouki = ( doc : jsPDF, lastPos : pos, list : RES_PDF_TANGO_LIST, fontSize : number = FONT_SIZE ) => {
        let _lastPos = lastPos;
        
        doc.setFont('jaNorm');
        doc.setFontSize(fontSize);

        if( list.length > 1 ){
            doc.text(GLYPH_ARROW, _lastPos.x - fontSize - MARGIN_MIN, _lastPos.y + fontSize/2, JATEXT_OPTION);

            for(let [i, data] of list.entries() ){
                if( i === 0 ){ continue }
                let { x : _x } = makeTextData(doc, _lastPos, data.textData, fontSize);
                _lastPos.x = _x;
                _lastPos.x += MARGIN_MIN;
            }

            return { x : _lastPos.x, y : _lastPos.y + fontSize*1.5 + MARGIN_MIN }
        }
        else{
            return _lastPos;
        }
    }

    const makeImi = ( doc : jsPDF, lastPos : pos, list : RES_PDF_TANGO_LIST, fontSize : number = FONT_SIZE ) => {
        let _lastPos = lastPos;

        let _fontSize = fontSize - 4

        let imiArr = list.map( (v) => { return v.imi })
            .filter( (v, i, arr) => arr.indexOf(v) === i );
        let imiStr = imiArr.join(', ');

        doc.setFont('koNorm');
        doc.setFontSize(_fontSize);

        doc.text(imiStr, _lastPos.x, _lastPos.y + fontSize*1.5 - _fontSize, JATEXT_OPTION);

        return { x : _lastPos.x + imiStr.length*_fontSize, y : _lastPos.y + fontSize*1.5 + MARGIN_MIN }
    }

    const makeIndex = ( doc : jsPDF, lastPos : pos, index : number, digit : number, fontSize : number = FONT_SIZE ) => {
        let _lastPos = lastPos;
        
        doc.setFont('jaNorm');
        doc.setFontSize(fontSize);
        doc.setTextColor(PRIMARY_COLOR);

        let indexStr = index.toString().padStart(digit, '0');

        doc.text(indexStr, _lastPos.x, _lastPos.y + fontSize/2, JATEXT_OPTION);

        doc.setTextColor(BALCK_COLOR);

        return { x : _lastPos.x + TAB_SIZE, y : _lastPos.y + fontSize*1.5 + MARGIN_MIN }
    }

    const makeTango = ( doc : jsPDF, lastPos : pos, index : number, list : RES_PDF_TANGO_LIST, fonstSize : number = FONT_SIZE ) => {
        let _lastPos = lastPos;

        lastPos = isNextPage(doc, _lastPos, list, fonstSize );

        let digit = index.toString().length;
        if( digit < 3 ){ digit = 3 }

        _lastPos = makeIndex(doc, lastPos, index, digit, fonstSize );
        _lastPos = makeTextData(doc, { x : _lastPos.x, y : lastPos.y }, list[0].textData, fonstSize); //lineheight 옵션으로 인해 조금 문제가 있을지도 모름
        _lastPos = makeImi(doc, { x : _lastPos.x + MARGIN_MIN*2, y : lastPos.y }, list, fonstSize);

        _lastPos = makeLine(doc, { x: lastPos.x, y : _lastPos.y });

        _lastPos = makeOtherHyouki(doc, { x : lastPos.x + TAB_SIZE, y : _lastPos.y }, list, fonstSize - 6);

        for(let bun of list){
            _lastPos = makeJaBun( doc, { x : lastPos.x + TAB_SIZE, y : _lastPos.y }, bun, fonstSize - 6);
            _lastPos = makeKoBun( doc, { x : lastPos.x + TAB_SIZE, y : _lastPos.y }, bun, fonstSize - 8);
        }

        return { x : lastPos.x, y : _lastPos.y + MARGIN_LINE };
    }

    const makeKanjiTextData = ( doc : jsPDF, lastPos : pos, data : RES_PDF_KANJI_DATA, fontSize : number = FONT_SIZE ) => {
        let { x, y } = lastPos;

        let rubySize = fontSize/2;

        doc.setFont('jaNorm');

        let _x = x;
        for( let v of data.textData ){
            if(v.ruby !== null ){
                let _rx = _x + (v.data.length*2 - v.ruby.length )/ 2 * rubySize;
                doc.setFontSize(rubySize);
                doc.setTextColor(BALCK_COLOR);
                doc.text(v.ruby, _rx, y, JATEXT_OPTION);
            }

            doc.setFontSize(fontSize);
            if( v.data.includes(data.jaText) === true ){
                for(let i = 0; i < v.data.length; i++ ){
                    if( v.data[i] === data.jaText ){
                        doc.setTextColor(PRIMARY_COLOR);
                    }
                    else{
                        doc.setTextColor(BALCK_COLOR);
                    }
                    doc.text(v.data[i], _x + i*fontSize, y+rubySize, JATEXT_OPTION);
                }
            }
            else{
                doc.setTextColor(BALCK_COLOR);
                doc.text(v.data, _x, y+rubySize, JATEXT_OPTION);
            }
            _x += v.data.length * fontSize;
        }

        return { x : _x, y : y + rubySize + fontSize + MARGIN_MIN }
    }

    const makeKanjiTango = ( doc : jsPDF, lastPos : pos, list : RES_PDF_KANJI_LIST, fontSize : number = FONT_SIZE ) => {
        let _lastPos = lastPos;

        let { x, y } = _lastPos;

        let maxWidth = doc.internal.pageSize.width - MARGIN;

        let _imiFontSize = fontSize - 4;

        doc.setFont('jaNorm');
        doc.setFontSize(fontSize);
        doc.setTextColor(BALCK_COLOR);

        for( let data of list ){
            if( x + data.hyouki.length*fontSize + data.imi.length*_imiFontSize + (MARGIN_MIN*2) > maxWidth ){
                y += fontSize*1.5 + MARGIN_MIN;
                x = lastPos.x;
            }
            let { x : _x } = makeKanjiTextData( doc, { x : x, y : y }, data, fontSize );

            x  = _x + MARGIN_MIN;

            if( data.imi !== '' ){
                doc.setFont('koNorm');
                doc.setFontSize(_imiFontSize);
                doc.setTextColor(BALCK_COLOR);
                doc.text(data.imi, x, y + fontSize*1.5 - _imiFontSize, JATEXT_OPTION);

                doc.setFont('jaNorm');
                doc.setFontSize(fontSize);
                x += data.imi.length*_imiFontSize + MARGIN_MIN;
            }
            else{
                x += fontSize;
            }
        }

        return { x : lastPos.x, y : Math.max(y + fontSize*1.5 + MARGIN_MIN*2, lastPos.y + fontSize*3 + MARGIN_MIN*2) }
    }

    const makeKanjiHeader = ( doc : jsPDF, lastPos : pos, data : RES_PDF_KANJI_DATA, fontSize : number = FONT_SIZE ) => {

        doc.setFont('jaBold');
        doc.setFontSize(fontSize);
        doc.setTextColor(BALCK_COLOR);

        doc.text(data.jaText, lastPos.x, lastPos.y, JATEXT_OPTION);

        return { x : lastPos.x + fontSize + MARGIN_MIN, y : lastPos.y + fontSize + MARGIN_MIN }
    }

    const makeKanji = ( doc : jsPDF, lastPos : pos, index : number, list : RES_PDF_KANJI_LIST, fontSize : number = FONT_SIZE ) => {
        let _lastPos = lastPos;

        lastPos = isNextPageKanji(doc, lastPos, list, fontSize);

        _lastPos = makeKanjiHeader( doc, lastPos, list[0], fontSize*3 + MARGIN_MIN );
        _lastPos = makeKanjiTango( doc, { x : _lastPos.x, y : lastPos.y }, list, fontSize );

        _lastPos = makeLine( doc, { x: lastPos.x, y : _lastPos.y + MARGIN_MIN } );

        return { x : lastPos.x, y : _lastPos.y }
    }

    const makePdf = ( pdfList : RES_PDF_ALL, opt : 'kanji' | 'tango' | 'both' = 'both' ) => {
        if( pdfList === null ){ return }

        let tangoList = pdfList.tangoList;
        let kanjiList = pdfList.kanjiList;

        let doc = new jsPDF({ 
            orientation : 'p',
            format : 'a4',
            unit : 'pt'

        })

        doc.addFileToVFS('jaBold.ttf', jaBold);  //_fonts 변수는 Base64 형태로 변환된 내용입니다.
        doc.addFont('jaBold.ttf','jaBold', 'normal');
        doc.addFileToVFS('jaNorm.ttf', jaNorm);
        doc.addFont('jaNorm.ttf','jaNorm', 'normal');

        doc.addFileToVFS('koLight.ttf', koLight);
        doc.addFont('koLight.ttf', 'koLight', 'normal');
        doc.addFileToVFS('koNorm.ttf', koNorm);
        doc.addFont('koNorm.ttf', 'koNorm', 'normal');
        doc.addFileToVFS('koBold.ttf', koBold);
        doc.addFont('koBold.ttf', 'koBold', 'normal');

        let lastPos : pos = { x : MARGIN, y : MARGIN };

        if( opt ==='tango' || opt === 'both' ){
            for( let [i, list] of tangoList.entries() ){
                lastPos = makeTango(doc, lastPos, i+1, list, 18);
            }

            if( opt === 'both' ){
                doc.addPage();
                lastPos = { x : MARGIN, y : MARGIN };
            }
        }
        
        if( opt === 'kanji' || opt === 'both' ){
            for( let [i, list] of kanjiList.entries() ){
                lastPos = makeKanji(doc, lastPos, i+1, list, 18);
            }
        }

        setPdf(doc);

        return doc;
    }

    const getPdf = ( pdfList : RES_PDF_ALL, opt : 'kanji' | 'tango' | 'both' = 'both' ) => {
        // let doc : jsPDF | null = null;
        // if(pdf == null){
        //     doc = makePdf( pdfList, opt ) ?? null;
        
        //     return doc;
        // }
        // else{
        //     return pdf;
        // }

        return makePdf( pdfList, opt );
    }

    return { getPdf }
}

export { usePDF }