import { readFileSync } from 'fs';

/*
  look for the environment variable named "name"
  if not found, look for the same variable with the sufix _FILE to get the file
  content
  if not found, return the default value 
*/
export function getVar(name: string , defaultValue = ''): string {
  if (process.env[name]) {
    return (process.env[name] as string).toLowerCase();
  }
  else {
    const value = process.env[name + '_FILE'];
    if (value) {
      return readFileSync(value, 'utf8').toLowerCase();
    }
  }
  return defaultValue;
}

/*
  parse a string to boolean
*/
export function string2Bool(value: string): boolean {
  return (/true/i).test(value);
}

/*
  converts a JSON object or array to a well formatted string
*/
export function json2String<T>(value: T): string {
  return JSON.stringify(value, null, 2).replace(/\n/gi, '\n  ');
}