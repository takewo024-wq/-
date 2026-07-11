// @types/node v20 には node:sqlite の型定義がまだ無いため、使用する範囲だけ宣言する。
// node:sqlite は Node.js 22 以降の組み込みモジュール（実験的機能）。
declare module "node:sqlite" {
  interface StatementSync {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }
  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
