import { auto_db } from "../type";

export function commitDataDTO( bunIds : RES_GET_TIMELINE["timeline"], data : auto_db ){
    return data.map( (v : any) => 
        v.reduce( (acc : any, cur : any) => { 
            return {...acc, [cur.id] : { 
                jaBId : bunIds[Number(cur.jaBId.slice(2))-1].jaBId,
                tId : null,
                skip : false,
            } } 
        }, {} ) 
    ).reduce( (acc : any, cur : any) => {
        return { ...acc, ...cur }
    }, {});
}