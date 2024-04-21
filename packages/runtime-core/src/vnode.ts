import { isArray, isFunction, isObject, isString, normalizeClass, ShapeFlags } from '@vue/shared'

export const Fragment = Symbol('Fragment')

export const Text = Symbol('Text')

export const Comment = Symbol('Comment')

export interface VNode {
  __v_isVNode: boolean
  type: any
  props: any
  children: any
  shapeFlag: number
  key: any
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode : false
}

export function createVNode(type: any, props?: any, children?: any): VNode {

  if (props) {
    const { class: klass, style } = props
    props.class = normalizeClass(klass)
  }

  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT
    : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
  return createBaseVNode(type, props, children, shapeFlag)
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0
  if (children === null || children === undefined) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (isObject(children)) {

  } else if (isFunction(children)) {

  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }
  vnode.children = children
  vnode.shapeFlag |= type
}

function createBaseVNode(type: any, props: any, children: any, shapeFlag: number) {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    shapeFlag
  } as VNode
  normalizeChildren(vnode, children)
  return vnode
}

export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}
