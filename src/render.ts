import {
    VNode,
    ComponentChild,
    ComponentChildren,
    createFragment,
    createComponent,
    Component,
    createVNode
} from './create-element'
import {PreaNode} from './internal-type'

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
    } else if (name[0] === 'o' || name[1] === 'n') {
        // この比較方法が早いらしい　https://esbench.com/bench/574c954bdb965b9a00965ac6
        // TODO
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
    } else {
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
    // TODO diffProps
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
    return dom
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
        } else if (renderResult._depth > 0) {
            // childVNodeはすでに使用されているので、複製する
            childVNode = createVNode(
                renderResult.type,
                renderResult.props,
                renderResult.key,
            )
        } else {
            childVNode = renderResult
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
            parentDom.appendChild(newDom)
        }
    }
    newParentVNode._dom = firstChildDom
    // 新たに作成されたdomを並び替える
    const childrenLength = newParentVNode._children.length
    let lastDom: PreaNode | null = null
    for (let i=childrenLength - 1; i>=0; i--) {
        const currentVNode = newParentVNode._children[i]
        if (! currentVNode?._dom) {
            continue
        }
        parentDom.insertBefore(currentVNode?._dom, lastDom || null)
        lastDom = currentVNode?._dom
    }
    
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
            component = newVNode._component = createComponent(newVNode.type)
        }
        const renderResult = component.render(newVNode.props)
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

const render = (vnode:ComponentChildren , parentDom: PreaNode) => {
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

export {
    render
}