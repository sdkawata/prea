import {h, VNode} from "../src/create-element"

describe("simple test", () => {
    it("simple", () => {
        const jsx:VNode = <div className="hoge"><span/>hoge<span/></div>
        expect(jsx.type).toEqual("div")
        expect(jsx.props["className"]).toEqual("hoge")
        expect((jsx.children[0] as VNode).type).toEqual("span")
        expect(jsx.children[1]).toEqual("hoge")
    })
})