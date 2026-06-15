
export interface AnalyzeTextObj {
  jaBId: string;
  jaText: string;
}

export interface AnalyzeToken {
  surface: string;
  pos: string;
  base: string;
  reading: string;
  jaBId : string;
  offset : number;
}

export interface ReadingToken {
  space : boolean;
  reading : string;
}

export interface MecabToken {
  surface: string;
  pos: string;
  base: string;
  reading: string;
  pos1?: string;
  pos2?: string;
  pos3?: string;
}

export interface YomiToken {
  surface: string;
  pos: string;
  base: string;
  reading: string;
}