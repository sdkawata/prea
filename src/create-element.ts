
interface VNode  {
    type: string,
    props: object,
    children: (VNode | string)[],
}

const jsxFactory = (type:string, props: object | null | undefined, ...children: (VNode | string)[]): VNode => {
    return {
        type,
        props,
        children,
    }
}
const h = jsxFactory
export {
    jsxFactory,
    h,
    VNode,
}