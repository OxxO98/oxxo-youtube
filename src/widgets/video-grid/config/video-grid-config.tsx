const IMG_SRC_URL = ['https://i.ytimg.com/vi/', '/hqdefault.jpg']

export function GET_IMG_SRC( src : string ){
    return `${IMG_SRC_URL[0]}${src}${IMG_SRC_URL[1]}`
}

export const span = {
    default : 6,
    xxl : 4,
    xl : 6,
    lg : 6,
    md : 8,
    sm : 12,
    xs : 24,
}