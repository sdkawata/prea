import {VNode, ComponentChild, ComponentChildren, createFragment, createComponent, Component, createVNode} from './create-element'

function renderDiffElementNodes(
    dom: Node | null,
    newVNode: VNode<any>,
    oldVNode: VNode<any> | null,
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
    return dom
}

function renderDiffChildren(
    parentDom: Node,
	renderResults: ComponentChild[],
	newParentVNode: VNode<any>,
	oldParentVNode: VNode<any> | null
): void {
    newParentVNode._children = []
    for(let i=0; i < renderResults.length; i++) {
        const renderResult = renderResults[i]
        let childVNode: VNode | null
        if (typeof renderResult === 'string' ||
            typeof renderResult === 'number') {
            childVNode = createVNode(
                null,
                renderResult
            )
        } else {
            childVNode = renderResult
        }
        newParentVNode._children[i] = childVNode
        if (childVNode === null) {
            continue;
        }
        const oldVNode = null
        renderDiff(
            parentDom,
            childVNode,
            oldVNode,
        )

        const newDom = childVNode._dom
        if (newDom !== null) {
            parentDom.appendChild(newDom)
        }
    }
}

function renderDiff(
    parentDom:Node,
    newVNode: VNode<any>,
    oldVNode: VNode<any> | null
) {
    if (typeof newVNode.type === 'function') {
        let component: Component
        // newVNode is function component
        if (oldVNode && oldVNode._component) {
            throw new Error('unimplemented')
        } else {
            component = newVNode._component = createComponent(newVNode.type)
        }
        const renderResult = component.render(newVNode.props)
        renderDiffChildren(
            parentDom,
            Array.isArray(renderResult) ? renderResult : renderResult !== null ? [renderResult] : [],
            newVNode,
            oldVNode,
        )
    } else {
        newVNode._dom = renderDiffElementNodes(
            oldVNode !== null ? oldVNode._dom : null,
            newVNode,
            oldVNode,
        )
    }
}

const render = (vnode:ComponentChildren , parentDom: Node) => {
    renderDiff(
        parentDom,
        typeof vnode === 'function'
        ? vnode
        : createFragment(vnode),
        null)
}

export {
    render
}