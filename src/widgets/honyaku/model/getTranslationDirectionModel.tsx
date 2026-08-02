
export function getHonyakuSelectModel( translates : RES_GET_TRANSLATE, direction : TranslationDirection ){
    if( direction === 'ja-ko' ){
        return {
            defaultValue : translates.koBun?.koText,
            options : translates.koList?.map( (v) => {
                    return { value : v.koBId, label : v.koText }
                })
        }
    }
    else{
        return {
            defaultValue : translates.jaBun?.jaText,
            options : translates.jaList?.map( (v) => {
                    return { value : v.jaBId, label : v.jaText }
                })
        }
    }
}