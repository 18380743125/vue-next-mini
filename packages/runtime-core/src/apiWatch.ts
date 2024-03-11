import { hasChanged, isObject } from '@vue/shared'
import { queuePreFlushCb } from './scheduler'
import { isReactive } from '../../reactivity/src/reactive'
import { ReactiveEffect } from '../../reactivity/src/effect'

/**
 * watch 配置项属性
 */
export interface WatchOptions<immediate = boolean> {
  immediate?: immediate
  deep?: boolean
}

/**
 * 指定的 watch 函数
 * @param source 监听的响应式数据
 * @param cb 回调函数
 * @param options 配置对象
 * @returns
 */
export function watch(source: any, cb: Function, options?: WatchOptions) {
  return doWatch(source, cb, options)
}

function doWatch(
  source: any,
  cb: Function,
  { immediate, deep }: WatchOptions = {}
) {
  // 触发 getter 的指定函数
  let getter: () => any
  // 判断 source 的数据类型
  if (isReactive(source)) {
    // 指定 getter
    getter = () => source
    deep = true
  } else {
    getter = () => {}
  }

  // 存在回调函数和 deep
  if (!!cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  // 旧值
  let oldValue = {}
  // job 执行方法
  const job = () => {
    if (!!cb) {
      const newValue = effect.run()
      if (deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue)
      }
    }
  }

  // 调度器
  let scheduler = () => queuePreFlushCb(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if (!!cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }
  return () => {
    effect.stop()
  }
}

// 依次执行 getter，从而触发依赖收集
export function traverse(value: unknown) {
  if (!isObject(value)) {
    return value
  }
  for (const key in value as object) {
    traverse((value as object)[key])
  }
  return value
}
