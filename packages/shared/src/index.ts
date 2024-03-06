/**
 * 判断是否为一个数组
 */
export const isArray = Array.isArray

/**
 * 判断是否为一个对象
 */
export const isObject = (value: unknown) => value !== null && typeof value === 'object'

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)

export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function'
}
