import {
    VNode,
    ComponentChild,
    ComponentChildren,
    createFragment,
    createComponent,
    Component,
    createVNode,
    isVNode
} from './create-element'
import { schedule } from './debounce'
import {PreaNode} from './internal-type'

type RenderEnterCB = (c:Component<any>) => void
let renderEnterCBList: (RenderEnterCB[]) = []
export function registerRenderEnterCB(cb: RenderEnterCB) {
    renderEnterCBList.push(cb)
}
type RenderExitCB = (c:Component<any>) => void
let renderExitCBList: (RenderExitCB[]) = []
export function registerRenderExitCB(cb: RenderExitCB) {
    renderExitCBList.push(cb)
}

function setStyle(
    style: CSSStyleDeclaration,
    key: string,
    value: any
) {
    const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
    if (key[0] === '-') {
        // ???
        style.setProperty(key, value)
    } else if (value === null) {
        style[key] = ''
    } else if (typeof value !== 'number' || IS_NON_DIMENSIONAL.test(key)) {
        style[key] = value;
	} else {
		style[key] = value + 'px';
    }
}

function eventProxy(e) {
    this._listeners[e.type]?.(e)
}

function setProperty(
    dom: PreaNode,
    name: string,
    value: any,
    oldValue: any
) {
    const style = (dom as HTMLElement).style
    if (name === 'style') {
        if (typeof value === 'string') {
            style.cssText = value
        } else {
            if (typeof oldValue === 'string') {
                style.cssText = oldValue = ''
            }
            if (oldValue) {
                for (name in oldValue) {
                    if (! (value && name in value)) {
                        setStyle(style, name, '')
                    }
                }
            }
            if (value) {
                for (name in value) {
                    if (!oldValue || value[name] !== oldValue[name]) {
                        setStyle(style, name, value[name])
                    }
                }
            }
        }
    } else if (name[0] === 'o' && name[1] === 'n') {
        // この比較方法が早いらしい　https://esbench.com/bench/574c954bdb965b9a00965ac6
        const nameLower = name.toLowerCase()
        const eventName = (nameLower in dom ? nameLower : name).slice(2);
        (dom._listeners = dom._listeners || {})[eventName] = value
        if (value) {
            dom.addEventListener(eventName, eventProxy)
        } else {
            dom.removeEventListener(eventName, eventProxy);
        }
    } else if (
        name !== 'list' &&
        name !== 'tagName' &&
        name !== 'form' &&
        name !== 'type' &&
        name !== 'size' &&
        name !== 'download' &&
        name !== 'href' &&
        name !== 'contentEditable' &&
        name in dom
    ) {
        dom[name] = value == null ? '' : value;
    } else if (typeof value != 'function') {
        if (value == null || value === false) {
            (dom as HTMLElement).removeAttribute(name)
        } else {
            (dom as Element).setAttribute(name, value);
        }
    }
}

// domにpropをsetする
function renderDiffProps(
    dom: PreaNode,
    newProps: object,
    oldProps: object
) {
    for (const i in oldProps) {
        if (i !== 'children' && i !== 'key' && !(i in newProps)) {
            setProperty(dom, i, null, oldProps)
        }
    }
    for (const i in newProps) {
        if (i !== 'children' &&
            i !== 'key' &&
            i != 'value' &&
            i != 'checked' &&
            oldProps?.[i] !== newProps[i]) {
            setProperty(dom, i, newProps[i], oldProps?.[i])
        }
    }
    // valueとcheckedはcontroll componentの都合？で差分によらず常にsetするので別に書く
    if ('value' in newProps &&
        newProps['value'] !== undefined &&
        newProps['value'] !== (dom as HTMLInputElement).value) {
        setProperty(dom, 'value', newProps['value'], false)
    }
    if ('checked' in newProps &&
        newProps['checked'] !== undefined &&
        newProps['checked'] !== (dom as HTMLInputElement).checked) {
        setProperty(dom, 'checked', newProps['checked'], false)
    }
}

// newVNodeに対応するdomを作成or更新する
// 作成or更新したdomを返す
// domへの追加はしない
function renderDiffElementNodes(
    dom: PreaNode | null,
    newVNode: VNode<any>,
    oldVNode: VNode<any> | null,
    excessDomChildren: PreaNode[] | null
): (Node | null) {
    if (dom === null) {
        if (newVNode.type === null) {
            return document.createTextNode(newVNode.props);
        } else {
            dom = document.createElement(
                newVNode.type as string,
                newVNode.props,
            )
        }
    }
    if (newVNode.type === null) {
        (dom as Text).data = newVNode.props
    } else {
        const newChildren = newVNode.props.children
        renderDiffChildren(
            dom,
            Array.isArray(newChildren) ? newChildren : [newChildren],
            newVNode,
            oldVNode,
            excessDomChildren,
        )
        renderDiffProps(
            dom,
            newVNode.props,
            oldVNode?.props,
        )
    }
    return dom
}

function placeChildren(
    parentDom: PreaNode,
    childrenVNode: (VNode | null)[],
    lastDom: Node | null,
): Node | null {

    const childrenLength = childrenVNode.length
    for (let i=childrenLength - 1; i>=0; i--) {
        const currentVNode = childrenVNode[i]
        if (typeof currentVNode?.type === 'function') {
            // currentVNodeがfragmentかfragmentを返すcomponentの可能性があるので、
            // まずcurrentVNodeの中身を並び替える
            const children = currentVNode._children
            if (children) {
                lastDom = placeChildren(parentDom, children, lastDom)
            }
        }
        if (! currentVNode?._dom) {
            continue
        }
        if (lastDom === null && currentVNode?._dom.parentElement !== parentDom) {
            parentDom.insertBefore(currentVNode?._dom, null)
        } else if (currentVNode?._dom?.nextSibling !== lastDom) {
            parentDom.insertBefore(currentVNode?._dom, lastDom || null)
        }
        lastDom = currentVNode?._dom
    }
    return lastDom
}

function renderDiffChildren(
    parentDom: Node,
	renderResults: ComponentChild[], // parentDomに追加するべきcomponentChild
	newParentVNode: VNode<any>,
	oldParentVNode: VNode<any> | null,
    excessDomChildren: PreaNode[] | null,
): void {
    const oldChildren: (VNode<any> | null)[] = oldParentVNode?._children || []
    let firstChildDom: Node | null = null
    newParentVNode._children = []
    for(let i=0; i < renderResults.length; i++) {
        const renderResult = renderResults[i]
        let childVNode: VNode | null
        if (renderResult === undefined || renderResult === null || typeof renderResult === 'boolean') {
            childVNode = null
        } else if (typeof renderResult === 'string' ||
            typeof renderResult === 'number') {
            childVNode = createVNode(
                null,
                renderResult,
                null,
            )
        } else if (Array.isArray(renderResult)) {
            childVNode = createFragment(
                renderResult
            )
        } else if (renderResult._depth > 0) {
            // childVNodeはすでに使用されているので、複製する
            childVNode = createVNode(
                renderResult.type,
                renderResult.props,
                renderResult.key,
            )
        } else if (isVNode(renderResult)) {
            childVNode = renderResult
        } else {
            childVNode = createVNode(
                null,
                '',
                null,
            )
        }
        newParentVNode._children[i] = childVNode
        if (childVNode === null) {
            continue;
        }
        childVNode._depth = newParentVNode._depth + 1
        // oldParentVNodeの中でtypeとkeyの一致するoldVNodeを探して更新元とする
        let oldVNode: VNode<any>| null = null
        if (! oldChildren[i]) {
            oldChildren[i] = null
        } else if (oldChildren[i] &&
            oldChildren[i]?.key === childVNode.key &&
            oldChildren[i]?.type === childVNode.type) {
            oldVNode = oldChildren[i] || null
            oldChildren[i] = null
        } else {
            const targetIndex = oldChildren.findIndex(vnode => (
                vnode && childVNode?.key == vnode.key && childVNode?.type === vnode.type
            ))
            if (targetIndex !== -1) {
                oldVNode = oldChildren[targetIndex] || null
                oldChildren[targetIndex] = null
            }
        }
        renderDiff(
            parentDom,
            childVNode,
            oldVNode,
            excessDomChildren,
        )
        const newDom = childVNode._dom
        if (newDom !== null) {
            if (firstChildDom === null) {
                firstChildDom = newDom
            }
        }
    }
    newParentVNode._dom = firstChildDom
    // 新たに追加されたdomを設置or並び替え
    placeChildren(
        parentDom,
        newParentVNode._children,
        null
    )
    
    // 不要なoldChildrenをunmountする
    for (let i=0;i<oldChildren.length; i++) {
        const child = oldChildren[i]
        if (!child) {
            continue
        }
        unmount(child)
    }
}

function renderDiff(
    parentDom:Node,
    newVNode: VNode<any>, // parentDomに追加するべきVNode
    oldVNode: VNode<any> | null, // parentDomにこれまで追加されていたVnode、存在しない場合はnull
    excessDomChildren: PreaNode[] | null, // parentDomのchildrenのうちまだどのVNodeにも再利用されていないDOM
) {
    if (typeof newVNode.type === 'function') {
        // newVNodeはfunction componentなのでcomponentを作成
        let component: Component
        if (oldVNode && oldVNode._component && oldVNode.type === newVNode.type) {
            component = newVNode._component = oldVNode._component
        } else {
            component = newVNode._component = createComponent(newVNode.type, newVNode)
        }
        renderEnterCBList.forEach((cb) => cb(component))
        const renderResult = component.render(newVNode.props)
        component._vnode = newVNode
        component._parentDom = parentDom
        component._dirty = false
        renderExitCBList.forEach((cb) => cb(component))
        renderDiffChildren(
            parentDom,
            Array.isArray(renderResult) ? renderResult : renderResult !== null ? [renderResult] : [],
            newVNode,
            oldVNode,
            excessDomChildren,
        )
    } else {
        newVNode._dom = renderDiffElementNodes(
            oldVNode !== null ? oldVNode._dom : null,
            newVNode,
            oldVNode,
            excessDomChildren,
        )
    }
}

export function render (vnode:ComponentChildren , parentDom: PreaNode)  {
    // TODO replaceDOM??
    const oldVNode = parentDom._children
    const newVNode = parentDom._children = createFragment(vnode) 
    renderDiff(
        parentDom,
        newVNode,
        oldVNode || null,
        parentDom.firstChild ? [].slice.call(parentDom.childNodes) : null,
    )
}

function unmount(vnode:VNode<any>) {
    if (vnode._children !== null) {
        for (const childVNode of vnode._children) {
            if (childVNode) {unmount(childVNode)}
        }
    }
    const dom = vnode._dom
    vnode._dom = null
    if (dom) {
        // remove dom from parent
        const parentNode = dom.parentNode
        if (parentNode) {parentNode.removeChild(dom)}
    }
}

let rerenderQueue: (Component[]) = []

export function enqueueRender(c: Component) {
    if (! c._dirty) {
        c._dirty = true
        rerenderQueue.push(c)
        schedule(flushRenderQueue)
    }
}

function flushRenderQueue() {
    while (rerenderQueue.length !== 0) {
        const queue = rerenderQueue.slice().sort((a, b) => a._vnode._depth - b._vnode._depth);
        rerenderQueue = []
        queue.forEach(c => {
            renderComponent(c)
        })
    }
}

function renderComponent(c: Component) {
    const vNode = c._vnode
    const oldVNode = Object.assign({}, vNode)
    const parentDom = c._parentDom
    if (! parentDom) {
        return
    }
    renderDiff(
        parentDom,
        vNode,
        oldVNode,
        []
    )
}