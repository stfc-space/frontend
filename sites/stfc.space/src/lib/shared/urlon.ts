'use strict';

const keyStringifyRegexp = /([=:@$/])/g;
const valueStringifyRegexp = /([&;/])/g;
const keyParseRegexp = /[=:@$]/;
const valueParseRegexp = /[&;]/;

function encodeString(str: string, regexp: RegExp | string) {
  return encodeURI(str.replace(regexp, '/$1'));
}

function trim(res: string | undefined) {
  return typeof res === 'string' ? res.replace(/;+$/g, '') : res;
}

function stringify(input: unknown, recursive?: boolean): string | undefined {
  if (!recursive) {
    return trim(stringify(input, true));
  }
  // Number, Boolean or Null
  if (typeof input === 'number' || input === true || input === false || input === null) {
    return ':' + input;
  }
  const res = [];
  // Array
  if (input instanceof Array) {
    for (let i = 0; i < input.length; ++i) {
      typeof input[i] === 'undefined' ? res.push(':null') : res.push(stringify(input[i], true));
    }
    return '@' + res.join('&') + ';';
  }
  // Object
  if (typeof input === 'object') {
    for (const key in input) {
      const val = stringify(input[key], true);
      if (val) {
        res.push(encodeString(key, keyStringifyRegexp) + val);
      }
    }
    return '$' + res.join('&') + ';';
  }
  // undefined
  if (typeof input === 'undefined') {
    return undefined;
  }
  // String
  return '=' + encodeString(input.toString(), valueStringifyRegexp);
}

function parse(str: string) {
  let pos = 0;
  str = decodeURI(str);

  function readToken(regexp: RegExp | string) {
    let token = '';
    for (; pos !== str.length; ++pos) {
      if (str.charAt(pos) === '/') {
        pos += 1;
        if (pos === str.length) {
          token += ';';
          break;
        }
      } else if (str.charAt(pos).match(regexp)) {
        break;
      }
      token += str.charAt(pos);
    }
    return token;
  }

  function parseToken<T = unknown>():
    | Array<T>
    | string
    | number
    | boolean
    | null
    | Record<string, unknown> {
    const type = str.charAt(pos++);
    // String
    if (type === '=') {
      return readToken(valueParseRegexp);
    }
    // Number, Boolean or Null
    if (type === ':') {
      const value = readToken(valueParseRegexp);
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
      const v = parseFloat(value);
      return isNaN(v) ? null : v;
    }
    let res: Array<unknown> | string | number | boolean | null | Record<string, unknown>;
    // Array
    if (type === '@') {
      res = [];
      loop: {
        // empty array
        if (pos >= str.length || str.charAt(pos) === ';') {
          break loop;
        }
        // parse array items
        for (;;) {
          res.push(parseToken());
          if (pos >= str.length || str.charAt(pos) === ';') {
            break loop;
          }
          pos += 1;
        }
      }
      pos += 1;
      return res as T[];
    }
    // Object
    if (type === '$') {
      const res = {} as object;
      loop: {
        if (pos >= str.length || str.charAt(pos) === ';') {
          break loop;
        }
        for (;;) {
          const name = readToken(keyParseRegexp);
          res[name] = parseToken();
          if (pos >= str.length || str.charAt(pos) === ';') {
            break loop;
          }
          pos += 1;
        }
      }
      pos += 1;
      return res as Record<string, unknown>;
    }
    // Error
    throw new Error('Unexpected char ' + type);
  }

  return parseToken();
}

export default { stringify, parse };
