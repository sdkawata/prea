import {h, VNode} from "../src/create-element"

describe("simple test", () => {
    it("simple", () => {
        const jsx:VNode = <div className="hoge"><span/>hoge<span/></div>
        expect(jsx.type).toEqual("div")
        expect((jsx.props as any).className).toEqual("hoge")
        expect((jsx.props as any).children[0].type).toEqual("span")
        expect((jsx.props as any).children[1]).toEqual("hoge")
    })
})