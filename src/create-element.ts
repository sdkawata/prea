

type VNodeType<P={}> = string | FC<P> | null
export interface VNode<P={}>  {
    type: VNodeType<P>,
    props: P,
    key: any,
    _component?: Component<P>,
    _children: (VNode<any> | null)[] | null,
    //このVNodeが返した最初のComponentChildに対応するDOM
    // Fragmentの仕様上一つのVNodeが複数のDOMに対応しうることに注意
    _dom: Node | null,
    // rootDOMからの深さ
    _depth: number,
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
    let key = null
    for (const propsKey in props) {
        if (propsKey === 'key') {
            key = props['key']
        }
        normalizedProps[propsKey] = props[propsKey]
    }
    if (children.length > 0) {
        normalizedProps.children = children
    }
    return createVNode(
        type,
        normalizedProps,
        key,
    )
}
export const h = jsxFactory

export function createVNode<P = {}>(type: VNodeType, props: P, key:any): VNode<P> {
    return ({
        type,
        props,
        key,
        _children: null,
        _dom: null,
        _depth: 0,
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