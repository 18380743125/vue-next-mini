/**
 * 判断是否为一个数组
 */
export const isArray = Array.isArray

/**
 * 判断是否为一个对象
 */
export const isObject = (value: unknown) => value !== null && typeof value === 'object'

/**
 * 是否是一个函数
 * @param value
 */
export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function'
}

/**
 * 判断是否为一个 string
 */
export const isString = (val: unknown): val is string => typeof val === 'string'

/**
 * 相关值是否相同
 * @param value
 * @param oldValue
 */
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)

/**
 * extend
 */
export const extend = Object.assign

/**
 * 空对象
 */
export const EMPTY_OBJ: { readonly [key: string]: any } = {}

const onRE = /^on[^a-z]/
/**
 * 是否以 on 开头
 */
export const isOn = (key: string) => onRE.test(key)

export { normalizeClass } from './normalizeProp'

export { ShapeFlags } from './shapeFlags'
