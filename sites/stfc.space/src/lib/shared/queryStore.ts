import URLON from './urlon';

import { goto } from '$app/navigation';
import { stringifyQuery } from './encoding';
import { isEqual } from 'lodash-es';

function isObject(v: unknown): v is object {
  return Object(v) === v;
}

let submitTimeout = null;

const queryStores = {};

export class QueryStore<Shape> {
  private fields: {
    [key: string]: {
      value: unknown;
      default: unknown;
    };
  } = {};
  private lastSubmitted = null;

  constructor(private readonly group: string) {
    // TODO(alexander): Save/load things to group in local storage
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      window.localStorage.setItem(group, '');
    }
    this.fields = queryStores[group] ?? {};
  }

  public addField<KeyType extends keyof Shape>(name: KeyType, defaultValue: Shape[KeyType]) {
    this.fields[name as string] = {
      value: this.fields[name as string]?.value,
      default: defaultValue
    };
    queryStores[this.group] = this.fields;
  }

  public updateField<KeyType extends keyof Shape>(name: KeyType, value: Shape[KeyType]) {
    if (name in this.fields) {
      this.fields[name as string].value = value;
    }
  }

  private submitQueryInternal() {
    const newQuery = this.toQuery();

    // TODO(alexander): Window may not be available :)
    if (
      decodeURIComponent(window.location.search.toString().substring(1)) !==
      decodeURIComponent(newQuery.toString())
    ) {
      const obj = {};
      newQuery.forEach((value, key) => {
        obj[key] = value;
      });
      this.lastSubmitted = newQuery.toString();
      goto(`?${stringifyQuery(obj)}`, { replaceState: true, keepFocus: true, noScroll: true });
    }
  }

  public submitQuery() {
    if (submitTimeout) {
      clearTimeout(submitTimeout);
    }
    submitTimeout = setTimeout(() => {
      this.submitQueryInternal();
      submitTimeout = null;
    }, 100);
  }

  public resetToDefault() {
    for (const value of Object.values(this.fields)) {
      value.value = undefined;
    }
  }

  public readField<KeyType extends keyof Shape>(name: KeyType): Shape[KeyType] | undefined {
    return (
      (this.fields[name as string]?.value as Shape[KeyType]) ??
      (this.fields[name as string]?.default as Shape[KeyType])
    );
  }

  public hasPendingSubmit() {
    return !!submitTimeout;
  }

  public setQuery(params: URLSearchParams, force = false): boolean {
    if (this.hasPendingSubmit()) {
      return;
    }
    if (this.lastSubmitted === null) {
      this.lastSubmitted = params.toString();
    }
    if (this.lastSubmitted == params.toString() && !force) {
      return false;
    }
    this.lastSubmitted = params.toString();

    for (const key of Object.keys(this.fields)) {
      const fieldType = typeof this.fields[key].default;
      const isPrimitive = !isObject(this.fields[key].default);
      const isArray = Array.isArray(this.fields[key].default);

      const value = params.get(key);
      if (!value) {
        this.fields[key].value = undefined;
      } else {
        let queryData: unknown;
        if (!isPrimitive) {
          try {
            if (isArray) {
              queryData = value.split(';');
            } else {
              queryData = Object.assign(this.fields[key].default, URLON.parse(value));
            }
          } catch (e) {
            // Intentionally left empty
          }
        } else {
          if (fieldType === 'string') {
            queryData = value.toString();
          } else if (fieldType === 'number') {
            queryData = parseInt(value);
          } else if (fieldType === 'boolean') {
            queryData = value === 'true' || value === '1';
          } else if (fieldType === 'object') {
            if (Array.isArray(this.fields[key].default)) {
              queryData = value.split(';').map((x) => {
                if (typeof this.fields[key].default[0] === 'number') {
                  return parseInt(x);
                } else {
                  return x;
                }
              });
            }
          }
        }
        // TODO(alexander): Support the other types as well :)
        this.fields[key].value = queryData;
      }
    }
    return true;
  }

  public toQuery(): URLSearchParams {
    const n = Object.entries(this.fields)
      .filter(([, value]) => {
        return value.value !== undefined && !isEqual(value.value, value.default);
      })
      .map(([key, value]) => {
        const isPrimitive = !isObject(value.default);
        const isArray = Array.isArray(this.fields[key].default);

        let encoded: string;
        if (isPrimitive) {
          if (typeof value.default === 'boolean') {
            encoded = value.value ? '1' : '0';
          } else {
            encoded = value.value.toString();
          }
        } else {
          if (isArray) {
            encoded = (value.value as Array<unknown>).join(';');
          } else {
            encoded = URLON.stringify(value.value);
          }
        }
        return [key, encoded];
      });
    return new URLSearchParams(n);
  }
}
