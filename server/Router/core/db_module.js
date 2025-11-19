"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.logImiDelete = exports.logImiInsert = exports.logHyoukiDelete = exports.logHyoukiUpdateHyoukiYomi = exports.logHyoukiInsert = exports.logHukumuDelete = exports.logHukumuUpdateHyId = exports.logHukumuUpdateOffsets = exports.logHukumuUpdateJaBIdOffsets = exports.logHukumuUpdateIId = exports.logHukumuInsert = exports.logYTBDelete = exports.logYTBUpdateTime = exports.logYTBUpdateKoBId = exports.logYTBInsert = exports.logJaBunDeleteYtBId = exports.logJaBunDelete = exports.logJaBunUpdateJaText = exports.logJaBunInsert = exports.logKoBunDeleteYtBId = exports.logKoBunDelete = exports.logKoBunUpdateYtBId = exports.logKoBunUpdateKoText = exports.logKoBunInsert = exports.logVideoInsert = exports.deleteKomu = exports.deleteKanji = exports.getMoreExistKanji = exports.getExistKId = exports.getKIds = exports.getKanjiArr = exports.getMoreExistTId = exports.getMoreExistHyId = exports.getExistHukumu = exports.deleteHukumu = exports.updateHukumHyouki = exports.getHukumu = exports.deleteHyouki = exports.updateHyouki = exports.makeTextData = exports.getExistHyouki = exports.deleteYTBun = exports.getYTBun = exports.deleteKoBun = exports.getKoBun = exports.deleteJaBun = exports.getJaBun = exports.getKoBuns = exports.getJaBuns = exports.getTimeline = void 0;
exports.logKanjiDelete = exports.logKanjiInsert = exports.logKomuDelete = exports.logKomuInsert = exports.logTangoDelete = exports.logTangoInsert = void 0;
/*
    delete의 경우 Id(primary key)로만 제거하는 방식
*/
//Table
function getTimeline(db, videoId) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var timeline;
        return __generator(this, function (_b) {
            timeline = (_a = db.data.videos.find(function (video) { return video.src == videoId; })) === null || _a === void 0 ? void 0 : _a.timeline;
            if (!timeline) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, timeline.sort(function (a, b) { return a.startTime - b.startTime; })];
        });
    });
}
exports.getTimeline = getTimeline;
function getJaBuns(db) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db.data.jaBuns];
        });
    });
}
exports.getJaBuns = getJaBuns;
function getKoBuns(db) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db.data.koBuns];
        });
    });
}
exports.getKoBuns = getKoBuns;
//Bun
//JaBun
function getJaBun(db, jaBId) {
    return __awaiter(this, void 0, void 0, function () {
        var jaBun;
        return __generator(this, function (_a) {
            jaBun = db.data.jaBuns.find(function (v) { return v.jaBId == jaBId; });
            if (!jaBun) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, jaBun];
        });
    });
}
exports.getJaBun = getJaBun;
function deleteJaBun(db, jaBId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            db.data.jaBuns = db.data.jaBuns.filter(function (v) { return v.jaBId != jaBId; });
            return [2 /*return*/];
        });
    });
}
exports.deleteJaBun = deleteJaBun;
//KoBun
function getKoBun(db, koBId) {
    return __awaiter(this, void 0, void 0, function () {
        var koBun;
        return __generator(this, function (_a) {
            if (koBId == null) {
                return [2 /*return*/, null];
            }
            koBun = db.data.koBuns.find(function (v) { return v.koBId == koBId; });
            if (!koBun) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, koBun];
        });
    });
}
exports.getKoBun = getKoBun;
function deleteKoBun(db, koBId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            db.data.koBuns = db.data.koBuns.filter(function (v) { return v.koBId != koBId; });
            return [2 /*return*/];
        });
    });
}
exports.deleteKoBun = deleteKoBun;
//YTBun
function getYTBun(timeline, ytBId) {
    return __awaiter(this, void 0, void 0, function () {
        var ytb;
        return __generator(this, function (_a) {
            ytb = timeline.find(function (v) { return v.ytBId == ytBId; });
            if (!ytb) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, ytb];
        });
    });
}
exports.getYTBun = getYTBun;
function deleteYTBun(db, videoId, ytBId) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var timeline;
        return __generator(this, function (_b) {
            timeline = (_a = db.data.videos.find(function (video) { return video.src == videoId; })) === null || _a === void 0 ? void 0 : _a.timeline;
            if (!timeline) {
                return [2 /*return*/];
            }
            db.data.videos.find(function (video) { return video.src == videoId; }).timeline = timeline.filter(function (v) { return v.ytBId != ytBId; });
            return [2 /*return*/];
        });
    });
}
exports.deleteYTBun = deleteYTBun;
//Tango
//Hyouki
function getExistHyouki(db, hyoukiStr, hyouki, yomi) {
    return __awaiter(this, void 0, void 0, function () {
        var _hyouki;
        return __generator(this, function (_a) {
            _hyouki = db.data.hyouki
                .filter(function (v) { return v.hyouki == hyoukiStr; })
                .filter(function (v) {
                var dataStr = v.textData.map(function (td) { return td.data; }).join('_');
                var rubyStr = v.textData.map(function (td) { return td.ruby == null ? '0' : td.ruby; }).join('_');
                return dataStr == hyouki && rubyStr == yomi;
            });
            if (_hyouki.length == 0) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, _hyouki[0]];
        });
    });
}
exports.getExistHyouki = getExistHyouki;
function makeTextData(hyouki, yomi) {
    return __awaiter(this, void 0, void 0, function () {
        var hyoukiArr, yomiArr, ret, acc, i;
        return __generator(this, function (_a) {
            hyoukiArr = hyouki.split('_');
            yomiArr = yomi.split('_');
            ret = [];
            acc = 0;
            for (i = 0; i < hyoukiArr.length; i++) {
                ret.push({
                    data: hyoukiArr[i],
                    ruby: yomiArr[i] == '0' ? null : yomiArr[i],
                    offset: acc
                });
                acc += hyoukiArr[i].length;
            }
            return [2 /*return*/, ret];
        });
    });
}
exports.makeTextData = makeTextData;
function updateHyouki(db, hyId, hyouki, yomi, hyoukiStr, yomiStr) {
    return __awaiter(this, void 0, void 0, function () {
        var textData, hy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeTextData(hyouki, yomi)];
                case 1:
                    textData = _a.sent();
                    hy = db.data.hyouki.find(function (v) { return v.hyId == hyId; });
                    if (hy) {
                        hy.textData = textData;
                        hy.hyouki = hyoukiStr;
                        hy.yomi = yomiStr;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateHyouki = updateHyouki;
function deleteHyouki(db, hyId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            db.data.hyouki = db.data.hyouki.filter(function (v) { return v.hyId != hyId; });
            return [2 /*return*/];
        });
    });
}
exports.deleteHyouki = deleteHyouki;
//Hukumu
function getHukumu(db, jaBId) {
    return __awaiter(this, void 0, void 0, function () {
        var hyoukis, hukumus;
        return __generator(this, function (_a) {
            hyoukis = db.data.hyouki;
            hukumus = db.data.hukumu
                .filter(function (v) { return v.jaBId == jaBId; })
                .map(function (v) {
                var hyouki = hyoukis.find(function (hy) { return v.hyId == hy.hyId; });
                if (hyouki != undefined) {
                    return __assign(__assign({}, v), hyouki);
                }
                else {
                    return undefined;
                }
            }).filter(function (v) { return v != undefined; })
                .sort(function (a, b) { return a.startOffset - b.startOffset; });
            return [2 /*return*/, hukumus];
        });
    });
}
exports.getHukumu = getHukumu;
function updateHukumHyouki(db, jaBId, startOffset, endOffset, hyId) {
    return __awaiter(this, void 0, void 0, function () {
        var hukumu;
        return __generator(this, function (_a) {
            hukumu = db.data.hukumu.find(function (v) {
                return v.jaBId == jaBId && v.startOffset == startOffset && v.endOffset == endOffset;
            });
            if (!hukumu) {
                return [2 /*return*/];
            }
            hukumu.hyId = hyId; //업데이트가 안될 수도 있음. //안되면 filter로 해보기
            return [2 /*return*/];
        });
    });
}
exports.updateHukumHyouki = updateHukumHyouki;
function deleteHukumu(db, jaBId, startOffset, endOffset) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            db.data.hukumu = db.data.hukumu.filter(function (v) {
                return !(v.jaBId == jaBId &&
                    v.startOffset == startOffset && v.endOffset == endOffset);
            });
            return [2 /*return*/];
        });
    });
}
exports.deleteHukumu = deleteHukumu;
function getExistHukumu(db, jaBId, startOffset, endOffset) {
    return __awaiter(this, void 0, void 0, function () {
        var hukumu;
        return __generator(this, function (_a) {
            hukumu = db.data.hukumu
                .find(function (v) {
                return v.jaBId == jaBId &&
                    v.startOffset == startOffset && v.endOffset == endOffset;
            });
            if (!hukumu) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, hukumu];
        });
    });
}
exports.getExistHukumu = getExistHukumu;
function getMoreExistHyId(db, hyId) {
    return __awaiter(this, void 0, void 0, function () {
        var hukumu;
        return __generator(this, function (_a) {
            hukumu = db.data.hukumu.
                filter(function (v) {
                return v.hyId == hyId;
            });
            return [2 /*return*/, hukumu.length > 1];
        });
    });
}
exports.getMoreExistHyId = getMoreExistHyId;
function getMoreExistTId(db, tId) {
    return __awaiter(this, void 0, void 0, function () {
        var hyouki;
        return __generator(this, function (_a) {
            hyouki = db.data.hyouki.filter(function (v) { return v.tId == tId; });
            return [2 /*return*/, hyouki.length > 1];
        });
    });
}
exports.getMoreExistTId = getMoreExistTId;
//Kanji & Komu
function getKanjiArr(hyouki) {
    return __awaiter(this, void 0, void 0, function () {
        var matched, arrKanji;
        return __generator(this, function (_a) {
            matched = hyouki.match(/[\u3400-\u9fff]/g);
            //한자 중복 제거.
            if (matched == null) {
                return [2 /*return*/, []];
            }
            arrKanji = matched.filter(function (v, i) { return matched.indexOf(v) == i; });
            return [2 /*return*/, arrKanji];
        });
    });
}
exports.getKanjiArr = getKanjiArr;
function getKIds(db, hyId) {
    return __awaiter(this, void 0, void 0, function () {
        var kIds;
        return __generator(this, function (_a) {
            kIds = db.data.komu.filter(function (v) { return v.hyId == hyId; }).map(function (v) { return v.kId; });
            return [2 /*return*/, kIds];
        });
    });
}
exports.getKIds = getKIds;
function getExistKId(db, kanji) {
    return __awaiter(this, void 0, void 0, function () {
        var find;
        return __generator(this, function (_a) {
            find = db.data.kanji.find(function (v) { return v.jaText == kanji; });
            if (find == undefined) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, find.kId];
        });
    });
}
exports.getExistKId = getExistKId;
function getMoreExistKanji(db, kId) {
    return __awaiter(this, void 0, void 0, function () {
        var komu;
        return __generator(this, function (_a) {
            komu = db.data.komu.filter(function (v) { return v.kId == kId; });
            return [2 /*return*/, komu.length > 1];
        });
    });
}
exports.getMoreExistKanji = getMoreExistKanji;
function deleteKanji(db, kId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            db.data.kanji = db.data.kanji.filter(function (v) { return v.kId != kId; });
            return [2 /*return*/];
        });
    });
}
exports.deleteKanji = deleteKanji;
function deleteKomu(db, hyId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            db.data.komu = db.data.komu.filter(function (v) { return v.hyId != hyId; });
            return [2 /*return*/];
        });
    });
}
exports.deleteKomu = deleteKomu;
//Logger
function _logText(str) {
    return "[".concat(str, "]");
}
function _logId(str) {
    if (str == null) {
        return "(null)";
    }
    return "(".concat(str, ")");
}
function _logTime(time) {
    var _hour = Math.floor(time / 3600).toString().padStart(2, '0');
    var _min = Math.floor(time / 60).toString().padStart(2, '0');
    var _sec = Math.floor(time % 60).toString().padStart(2, '0');
    var _msec = Math.floor(time % 1 * 1000).toString().padStart(3, '0');
    return "[".concat(_hour, ":").concat(_min, ":").concat(_sec, ".").concat(_msec, "]");
}
//Video
function logVideoInsert(title, src) {
    return "VIDEO \uCD94\uAC00 TITLE ".concat(_logText(title), " SRC ").concat(_logText(src));
}
exports.logVideoInsert = logVideoInsert;
//koBun
function logKoBunInsert(koBId, koText, ytBId) {
    return "KOBUN \uCD94\uAC00 KOBID ".concat(_logId(koBId), " KOTEXT ").concat(_logText(koText), " YTBID ").concat(_logId(ytBId));
}
exports.logKoBunInsert = logKoBunInsert;
function logKoBunUpdateKoText(koBun, newKoText) {
    return "KOBUN ".concat(_logId(koBun.koBId), " KOTEXT \uC218\uC815 ").concat(_logText(koBun.koText), " --> ").concat(_logText(newKoText));
}
exports.logKoBunUpdateKoText = logKoBunUpdateKoText;
function logKoBunUpdateYtBId(koBun, newYtBId) {
    return "KOBUN ".concat(_logId(koBun.koBId), " YTBID \uC218\uC815 ").concat(_logId(koBun.ytBId), " --> ").concat(_logId(newYtBId));
}
exports.logKoBunUpdateYtBId = logKoBunUpdateYtBId;
function logKoBunDelete(koBId) {
    return "KOBUN ".concat(_logId(koBId), " \uC0AD\uC81C");
}
exports.logKoBunDelete = logKoBunDelete;
function logKoBunDeleteYtBId(ytBId) {
    return "KOBUN \uBAA8\uB4E0 YTBID ".concat(_logId(ytBId), " \uC0AD\uC81C");
}
exports.logKoBunDeleteYtBId = logKoBunDeleteYtBId;
//jaBun
function logJaBunInsert(jaBId, jaText, ytBId) {
    return "JABUN \uCD94\uAC00 JABID ".concat(_logId(jaBId), " JATEXT ").concat(_logText(jaText), " YTBID ").concat(_logId(ytBId));
}
exports.logJaBunInsert = logJaBunInsert;
function logJaBunUpdateJaText(jaBun, newJaText) {
    return "JABUN ".concat(_logId(jaBun.jaBId), " JATEXT \uC218\uC815 ").concat(_logText(jaBun.jaText), " --> ").concat(_logText(newJaText));
}
exports.logJaBunUpdateJaText = logJaBunUpdateJaText;
function logJaBunDelete(jaBId) {
    return "JABUN ".concat(_logId(jaBId), " \uC0AD\uC81C");
}
exports.logJaBunDelete = logJaBunDelete;
function logJaBunDeleteYtBId(ytBId) {
    return "JABUN \uBAA8\uB4E0 YTBID ".concat(_logId(ytBId), " \uC0AD\uC81C");
}
exports.logJaBunDeleteYtBId = logJaBunDeleteYtBId;
//YTB
function logYTBInsert(ytBId, jaBId, startTime, endTime, koBId) {
    if (koBId === void 0) { koBId = null; }
    return "YTB \uCD94\uAC00 YTB ".concat(_logId(ytBId), " JABID ").concat(_logId(jaBId), " KOBID ").concat(_logId(koBId), " STARTTIME ").concat(_logTime(startTime), " ENDTIME ").concat(_logTime(endTime));
}
exports.logYTBInsert = logYTBInsert;
function logYTBUpdateKoBId(ytb, newKoBId) {
    return "YTB ".concat(_logId(ytb.ytBId), " KOBID \uC218\uC815 ").concat(_logId(ytb.koBId), " --> ").concat(_logId(newKoBId));
}
exports.logYTBUpdateKoBId = logYTBUpdateKoBId;
function logYTBUpdateTime(ytb, newStartTime, newEndTime) {
    return "YTB ".concat(_logId(ytb.ytBId), " STARTTIME \uC218\uC815 ").concat(_logTime(ytb.startTime), " --> ").concat(_logTime(newStartTime), " ENDTIME \uC218\uC815 ").concat(_logTime(ytb.endTime), " --> ").concat(_logTime(newEndTime));
}
exports.logYTBUpdateTime = logYTBUpdateTime;
function logYTBDelete(ytBId) {
    return "YTB ".concat(_logId(ytBId), " \uC0AD\uC81C");
}
exports.logYTBDelete = logYTBDelete;
//HUKUMU
function logHukumuInsert(jaBId, startOffset, endOffset, hyId, tId) {
    return "HUKUMU \uCD94\uAC00 JABID ".concat(_logId(jaBId), " STARTOFFSET ").concat(startOffset.toString(), " ENDOFFSET ").concat(endOffset.toString(), " HYID ").concat(_logId(hyId), " TID ").concat(_logId(tId));
}
exports.logHukumuInsert = logHukumuInsert;
function logHukumuUpdateIId(hukumu, newIId) {
    return "HUKUMU ".concat(_logId(hukumu.jaBId), " IID \uC218\uC815 ").concat(_logId(hukumu.iId), " --> ").concat(_logId(newIId));
}
exports.logHukumuUpdateIId = logHukumuUpdateIId;
function logHukumuUpdateJaBIdOffsets(hukumu, newJaBId, newStartOffset, newEndOffset) {
    return "HUKUMU ".concat(_logId(hukumu.jaBId), " JABID \uC218\uC815 ").concat(_logId(hukumu.jaBId), " --> ").concat(_logId(newJaBId), " STARTOFFSET \uC218\uC815 ").concat(hukumu.startOffset.toString(), " --> ").concat(newStartOffset.toString(), " ENDOFFSET \uC218\uC815 ").concat(hukumu.endOffset.toString(), " --> ").concat(newEndOffset.toString());
}
exports.logHukumuUpdateJaBIdOffsets = logHukumuUpdateJaBIdOffsets;
function logHukumuUpdateOffsets(hukumu, newStartOffset, newEndOffset) {
    return "HUKUMU ".concat(_logId(hukumu.jaBId), " STARTOFFSET \uC218\uC815 ").concat(hukumu.startOffset.toString(), " --> ").concat(newStartOffset.toString(), " ENDOFFSET \uC218\uC815 ").concat(hukumu.endOffset.toString(), " --> ").concat(newEndOffset.toString());
}
exports.logHukumuUpdateOffsets = logHukumuUpdateOffsets;
function logHukumuUpdateHyId(hukumu, hyId) {
    return "HUKUMU ".concat(_logId(hukumu.jaBId), " HYID \uC218\uC815 ").concat(_logId(hukumu.hyId), " --> ").concat(_logId(hyId));
}
exports.logHukumuUpdateHyId = logHukumuUpdateHyId;
function logHukumuDelete(jaBId, startOffset, endOffset) {
    return "HUKUMU JABID ".concat(_logId(jaBId), " STARTOFFSET ").concat(startOffset.toString(), " ENDOFFSET ").concat(endOffset.toString(), " \uC0AD\uC81C");
}
exports.logHukumuDelete = logHukumuDelete;
//HYOUKI
function logHyoukiInsert(hyId, yomi, hyouki, tId) {
    return "HYOUKI \uCD94\uAC00 HYID ".concat(_logId(hyId), " YOMI ").concat(_logText(yomi), " HYOUKI ").concat(_logText(hyouki), " TID ").concat(_logId(tId));
}
exports.logHyoukiInsert = logHyoukiInsert;
function logHyoukiUpdateHyoukiYomi(hy, hyouki, yomi) {
    return "HYOUKI ".concat(_logId(hy.hyId), " HYOUKI \uC218\uC815 ").concat(_logText(hy.hyouki), " --> ").concat(_logText(hyouki), " YOMI \uC218\uC815 ").concat(_logText(hy.yomi), " --> ").concat(_logText(yomi));
}
exports.logHyoukiUpdateHyoukiYomi = logHyoukiUpdateHyoukiYomi;
function logHyoukiDelete(hyId) {
    return "HYOUKI ".concat(_logId(hyId), " \uC0AD\uC81C");
}
exports.logHyoukiDelete = logHyoukiDelete;
//imi
function logImiInsert(iId, koText, tId) {
    return "IMI \uCD94\uAC00 IID ".concat(_logId(iId), " KOTEXT ").concat(_logText(koText), " TID ").concat(_logId(tId));
}
exports.logImiInsert = logImiInsert;
function logImiDelete(iId) {
    return "IMI ".concat(_logId(iId), " \uC0AD\uC81C");
}
exports.logImiDelete = logImiDelete;
//TANGO
function logTangoInsert(tId) {
    return "TANGO \uCD94\uAC00 TID ".concat(_logId(tId));
}
exports.logTangoInsert = logTangoInsert;
function logTangoDelete(tId) {
    return "TANGO ".concat(_logId(tId), " \uC0AD\uC81C");
}
exports.logTangoDelete = logTangoDelete;
//KOMU
function logKomuInsert(hyId, kId) {
    return "KOMU \uCD94\uAC00 HYID ".concat(_logId(hyId), " KID ").concat(_logId(kId));
}
exports.logKomuInsert = logKomuInsert;
function logKomuDelete(hyId) {
    return "KOMU HYID ".concat(_logId(hyId), " \uC0AD\uC81C");
}
exports.logKomuDelete = logKomuDelete;
//KANJI
function logKanjiInsert(kId, jaText) {
    return "KANJI \uCD94\uAC00 KID ".concat(_logId(kId), " JATEXT ").concat(_logId(jaText));
}
exports.logKanjiInsert = logKanjiInsert;
function logKanjiDelete(kId) {
    return "KANJI ".concat(_logId(kId), " \uC0AD\uC81C");
}
exports.logKanjiDelete = logKanjiDelete;
