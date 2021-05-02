import {render} from '../src/render'
import {h, VNode} from "../src/create-element"

describe('render()', () => {
    let rootDOM: HTMLDivElement | null;
    beforeEach(() => {
        rootDOM = document.createElement('div')
        document.body.appendChild(rootDOM)
    })
    afterEach(() => {
        rootDOM?.parentNode?.removeChild(rootDOM)
        rootDOM = null
    })

    it('should render text', () => {
        render('hoge', rootDOM!);
		expect(rootDOM?.innerHTML).toEqual('hoge');
        const c = rootDOM?.childNodes;
        expect(c?.length).toEqual(1)
        expect((c?.[0] as Text).data).toEqual('hoge')
        expect(c?.[0].nodeName).toEqual('#text')
	});

    it('should allow node type change with content', () => {
		render(<span>Bad</span>, rootDOM!);
		render(<div>Good</div>, rootDOM!);
		expect(rootDOM?.innerHTML).toEqual(`<div>Good</div>`);
	});

    it('shoud create empty nodes', () => {
        render(<div/>, rootDOM!)
        expect(rootDOM?.childNodes.length).toEqual(1)
        expect(rootDOM?.childNodes[0].nodeName).toEqual('DIV')

        rootDOM?.parentNode?.removeChild(rootDOM)
        rootDOM = document.createElement('div')
        document.body.appendChild(rootDOM)

        render(<span/>, rootDOM!)
        expect(rootDOM?.childNodes.length).toEqual(1)
        expect(rootDOM?.childNodes[0].nodeName).toEqual('SPAN')
    })
})