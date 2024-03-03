import { track, trigger } from './effect'

function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const result = Reflect.get(target, key, receiver)
    // 依赖收集
    track(target, key)
    return result
  }
}

const get = createGetter()

function createSetter() {
  return function set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const result = Reflect.set(target, key, value, receiver)
    // 触发依赖
    trigger(target, key, value)
    return result
  }
}

const set = createSetter()

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
