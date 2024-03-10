import { isReactive } from '../../reactivity/src/reactive'
import { queuePreFlushCb } from './scheduler'
import { ReactiveEffect } from '../../reactivity/src/effect'
import { hasChanged, isObject } from '@vue/shared'


export interface WatchOptions<immediate = boolean> {
  immediate?: immediate
  deep?: boolean
}

export function watch(source: any, cb: (...args: any[]) => void, options?: WatchOptions) {
  return doWatch(source, cb, options)
}

function doWatch(source: any, cb: (...args: any[]) => void, { immediate, deep }: WatchOptions = {}) {
  let getter: () => any
  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else {
    getter = () => {
    }
  }

  if (!!cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let oldValue = {}

  const job = () => {
    if (!!cb) {
      const newValue = effect.run()
      if (deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue)
      }
    }
  }

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

export function traverse(value: unknown) {
  if (!isObject(value)) {
    return value
  }
  for (const key in value as object) {
    traverse((value as object)[key])
  }
  return value
}
