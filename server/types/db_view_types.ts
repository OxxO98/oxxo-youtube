import type {
  HukumuData,
  Kanji,
  koBun,
  TextData,
  Video,
  YTB,
  jaBun,
} from "./db_types.js";

export type TimelineBun = YTB & Partial<jaBun> & Partial<koBun>;

export type VideoTimelineBun = TimelineBun & {
  title: Video["title"];
  src: Video["src"];
  lastEditTime?: number | null;
};

export interface JaTextData {
  data: string;
  ruby: string | null;
  offset: number;
}

export type ShareBun = TimelineBun & {
  textData?: Array<{
    d?: string;
    r?: string;
    o: number;
  }>;
};

export type ExportJsonBun = TimelineBun & {
  textData?: JaTextData[];
  reading?: string;
};

export type SearchTextBun = VideoTimelineBun & {
  hukumus: HukumuData[];
  jaTextData: TextData[];
  ruby: string;
  reading?: string;
};

export type TangoSearchKanji = Kanji | undefined;
