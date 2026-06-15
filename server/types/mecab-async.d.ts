declare module "mecab-async" {
  export default class MeCab {
    parse(text: string, callback: (err: Error | null, result: unknown) => void): void;
    wakachi(text: string, callback: (err: Error | null, result: string[]) => void): void;
  }
}