import { createVNode, Fragment, isSameVNodeType, Text } from './vnode'
import { EMPTY_OBJ, isString, ShapeFlags } from '@vue/shared'
import { normalizeVNode, renderComponentRoot } from './componentRenderUtils'
import { createComponentInstance, setupComponent } from './component'
import { ReactiveEffect } from '../../reactivity/src/effect'
import { queuePreFlushCb } from './scheduler'

export interface RendererOptions {
  /**
   * 为指定的 element 的 props 打补丁
   */
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void

  /**
   * 为指定的 element 设置 text
   */
  setElementText(node: Element, text: string): void

  /**
   * 插入指定的 el 到 parent 中, anchor 表示插入的位置 (锚点)
   */
  insert(el: Element, parent: Element, anchor?: Element): void

  /**
   * 创建 element
   */
  createElement(type: string)

  remove(el: Element)

  createText(text: string)

  setText(node, text)

  createComment(text: string)
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {

  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment
  } = options

  const processComponent = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountComponent(newVNode, container, anchor)
    } else {

    }
  }

  const processFragment = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountChildren(newVNode.children, container, anchor)
    } else {
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }

  const processCommentNode = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      newVNode.el = hostCreateComment(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      newVNode.el = oldVNode.el
    }
  }

  const processText = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      newVNode.el = hostCreateText(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      const el = (newVNode.el = oldVNode.el)
      if (newVNode.children !== oldVNode.children) {
        hostSetText(el, newVNode.children)
      }
    }
  }

  const processElement = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 挂载操作
      mountElement(newVNode, container, anchor)
    } else {
      // 更新操作
      patchElement(oldVNode, newVNode)
    }
  }

  const patchElement = (oldVNode, newVNode) => {
    const el = (newVNode.el = oldVNode.el)

    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    patchChildren(oldVNode, newVNode, el, null)

    patchProps(el, newVNode, oldProps, newProps)
  }

  const patchProps = (el: Element, vnode, oldProps, newProps) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }

      if (!!oldProps) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  const mountChildren = (children, container, anchor) => {
    if (isString(children)) {
      children = children.split('')
    }
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }

  const patchChildren = (oldVNode, newVNode, container, anchor) => {
    const c1 = oldVNode && oldVNode.children
    const prevShapeFlag = oldVNode.shapeFlag ? oldVNode.shapeFlag : 0
    const c2 = newVNode && newVNode.children
    const { shapeFlag } = newVNode

    if (!!(shapeFlag & ShapeFlags.TEXT_CHILDREN)) {
      if (!!(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN)) {
        // TODO 卸载旧子节点
      }

      if (c1 !== c2) {
        // 挂载新子节点的文本
        hostSetElementText(container, c2)
      }
    } else {
      if (!!(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN)) {
        if (!!(shapeFlag & ShapeFlags.ARRAY_CHILDREN)) {
          // TODO diff
        } else {
          // TODO 卸载
        }
      } else {
        if (!!(prevShapeFlag & ShapeFlags.TEXT_CHILDREN)) {
          // 删除旧节点的 text
          hostSetElementText(container, '')
        }
        if (!!(shapeFlag & ShapeFlags.ARRAY_CHILDREN)) {
          // TODO 单独新子节点挂载操作
        }
      }
    }
  }

  const mountComponent = (initialVNode, container, anchor) => {
    initialVNode.component = createComponentInstance(initialVNode)
    const instance = initialVNode.component

    setupComponent(instance)

    setupRenderEffect(instance, initialVNode, container, anchor)

  }

  const setupRenderEffect = (instance, initialVNode, container, anchor) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const subTree = instance.subTree = renderComponentRoot(instance)
        patch(null, subTree, container, anchor)

        initialVNode.el = subTree.el
      } else {

      }
    }

    const effect = (instance.effect = new ReactiveEffect(componentUpdateFn, () => queuePreFlushCb(update)))

    const update = (instance.update = () => effect.run())
    update()
  }

  const mountElement = (vnode, container, anchor) => {
    const { type, props, shapeFlag } = vnode
    // 1.创建 element
    const el = vnode.el = hostCreateElement(type)
    // 2.设置文本
    if (!!(shapeFlag & ShapeFlags.TEXT_CHILDREN)) {
      hostSetElementText(el, vnode.children)
    } else if (!!(shapeFlag & ShapeFlags.ARRAY_CHILDREN)) {

    }
    // 3.设置 props
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 4.插入
    hostInsert(el, container, anchor)
  }

  const patch = (oldVNode, newVNode, container, anchor = null) => {
    if (oldVNode === newVNode) {
      return
    }

    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }

    const { type, shapeFlag } = newVNode

    switch (type) {
      case Text:
        processText(oldVNode, newVNode, container, anchor)
        break
      case Comment:
        processCommentNode(oldVNode, newVNode, container, anchor)
        break
      case Fragment:
        processFragment(oldVNode, newVNode, container, anchor)
        break
      default:
        if (!!(shapeFlag & ShapeFlags.ELEMENT)) {
          processElement(oldVNode, newVNode, container, anchor)
        } else if (!!(shapeFlag & ShapeFlags.COMPONENT)) {
          processComponent(oldVNode, newVNode, container, anchor)
        }
    }
  }

  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }

  const render = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }

    container._vnode = vnode

  }

  return {
    render
  }
}
