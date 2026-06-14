declare module 'papaparse' {
  export interface ParseConfig {
    header?: boolean;
    skipEmptyLines?: boolean;
    trimHeaders?: boolean;
    [key: string]: any;
  }

  export interface ParseResult<T = any> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  export interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    fields?: string[];
    truncated: boolean;
  }

  export function parse<T = any>(
    input: string | File,
    config?: ParseConfig
  ): ParseResult<T>;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}

