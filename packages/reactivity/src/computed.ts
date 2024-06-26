import { isFunction } from '@vue/shared'
import { Dep } from './dep'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

export class ComputedRefImpl<T> {

  private _value!: T

  public dep?: Dep = undefined

  public readonly effect: ReactiveEffect<T>

  public readonly __v_isRef = true

  public _dirty = true

  constructor(getter: any) {
    this.effect = new ReactiveEffect<T>(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
    })
    this.effect.computed = this
  }

  get value() {
    trackRefValue(this)
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
}

export function computed(getterOrOptions: any) {
  let getter: any

  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
  }

  return new ComputedRefImpl(getter)
}
