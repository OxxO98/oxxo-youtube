
type WithTableKey<T> = T & {
    key: React.Key;
};

export type DBTangoDataType = WithTableKey<db_tango_data>;

export type DBHukumuDataType = WithTableKey<db_hukumu_data>;

export type DBVideoDataType = WithTableKey<db_video_data>;

export type DBTextDataType = WithTableKey<db_text_data>;

export type HukumuDataType = WithTableKey<HukumuData>;