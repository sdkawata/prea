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

    it('should support custom tag names', () => {
		render(<foo />, rootDOM!);
		expect(rootDOM!.childNodes.length).toEqual(1);
		expect(rootDOM!.firstChild!.nodeName).toEqual('FOO');

		rootDOM!.parentNode?.removeChild(rootDOM!);
		rootDOM! = document.createElement('div');
		document.body.appendChild(rootDOM!);

		render(<x-bar />, rootDOM!);
		expect(rootDOM!.childNodes.length).toEqual(1);
		expect(rootDOM!.firstChild!.nodeName).toEqual('X-BAR');
	});

    it('should support the form attribute', () => {
		render(
			<div>
				<form id="myform" />
				<button form="myform">test</button>
				<input form="myform" />
			</div>,
			rootDOM!
		);
		const div = rootDOM!.childNodes[0];
		const form = div.childNodes[0] as HTMLFormElement;
		const button = div.childNodes[1] as HTMLButtonElement;
		const input = div.childNodes[2]  as HTMLInputElement;

		expect(button.form).toEqual(form);
		expect(input.form).toEqual(form);
	});

	it('should allow VNode reuse', () => {
		let reused = <div class="reuse">Hello World!</div>;
		render(
			<div>
				{reused}
				<hr />
				{reused}
			</div>,
			rootDOM!
		);
		expect(rootDOM!.innerHTML).toEqual(
			`<div><div class="reuse">Hello World!</div><hr><div class="reuse">Hello World!</div></div>`
		);

		render(
			<div>
				<hr />
				{reused}
			</div>,
			rootDOM!
		);
		expect(rootDOM!.innerHTML).toEqual(
			`<div><hr><div class="reuse">Hello World!</div></div>`
		);
	});
})