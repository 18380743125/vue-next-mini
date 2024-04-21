import { isArray, isObject, isString } from '.'

export function normalizeClass(value: unknown): string {
  let res = ''
  if (isString(value)) {
    res = value
  } else if (isArray(value)) {
    for (const item of value) {
      const normalized = normalizeClass(item)
      if (normalized) {
        res += normalized + ' '
      }
    }
  } else if (isObject(value)) {
    for (const key in value as object) {
      if ((value as object)[key]) {
        res += key + ' '
      }
    }
  }
  return res.trim()
}
