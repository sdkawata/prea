

type VNodeType<P={}> = string | FC<P> | null
export interface VNode<P={}>  {
    type: VNodeType<P>,
    props: P,
    _component?: Component<P>,
    _children: VNode<any>[] | null,
    _dom: Node | null,
}

export interface FC<P = {}> {
    (props:P): ComponentChildren
}
export interface Component<P = {}> {
    render(props:P): ComponentChildren
}
export type ComponentChild = VNode | string | number
export type ComponentChildren = ComponentChild[] | ComponentChild | null

type NormalizedProps<P> = P & {children: ComponentChildren}
export function jsxFactory<P = {}>(type:VNodeType<NormalizedProps<P>>, props: P, ...children: ComponentChild[]): VNode<NormalizedProps<P>> {
    const normalizedProps: any = {}
    for (const key in props) {
        normalizedProps[key] = props[key]
    }
    if (children.length > 0) {
        normalizedProps.children = children
    }
    return createVNode(
        type,
        normalizedProps,
    )
}
export const h = jsxFactory

export function createVNode<P = {}>(type: VNodeType, props: P): VNode<P> {
    return ({
        type,
        props,
        _children: null,
        _dom: null,
    })
}

export function createFragment(children: ComponentChildren):VNode<{children: ComponentChildren}> {
    const arrayedChildren = Array.isArray(children) ? children : children !== null ? [children] : []
    return jsxFactory<{}>((props) => props.children, {}, ...arrayedChildren)
}

export function createComponent<P>(f: FC<P>):Component<P> {
    return {
        render(props){ return f(props)}
    }
}