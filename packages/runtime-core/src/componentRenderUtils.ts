import { createVNode, Text } from './vnode'
import { ShapeFlags } from '@vue/shared'

export function renderComponentRoot(instance) {
  const { vnode, render } = instance
  let result

  try {
    if (!!(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)) {
      result = normalizeVNode(render!())
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

export function normalizeVNode(child) {
  if (typeof child === 'object') {
    return cloneIfMounted(child)
  } else {
    return createVNode(Text, null, String(child))
  }
}

export function cloneIfMounted(child) {
  return child
}
