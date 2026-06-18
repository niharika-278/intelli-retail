import { randomUUID } from 'crypto';
export function makeId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
}