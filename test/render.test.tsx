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

    it('should merge new elements when called multiple times', () => {
		render(<div />,rootDOM!);
		expect(rootDOM!.childNodes.length).toEqual(1);
		expect(rootDOM!.firstChild?.nodeName).toEqual('DIV');
		expect(rootDOM!.innerHTML).toEqual('<div></div>');

		render(<span />,rootDOM!);
		expect(rootDOM!.childNodes.length).toEqual(1);
		expect(rootDOM!.firstChild?.nodeName).toEqual('SPAN');
		expect(rootDOM!.innerHTML).toEqual('<span></span>');

		render(<span class="hello">Hello!</span>,rootDOM!);
		expect(rootDOM!.childNodes.length).toEqual(1);
		expect(rootDOM!.firstChild?.nodeName).toEqual('SPAN');
		expect(rootDOM!.innerHTML).toEqual('<span class="hello">Hello!</span>');
	});

    it('should not render falsy values', () => {
		render(
			<div>
				{null},{undefined},{false},{0},{NaN}
			</div>,
			rootDOM!
		);

		expect((rootDOM!.firstChild as Element).innerHTML).toEqual(',,,0,NaN');
	});

	it('should not render null', () => {
		render(null, rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('');
		expect(rootDOM!.childNodes?.length).toEqual(0);
	});

	it('should not render undefined', () => {
		render(undefined, rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('');
		expect(rootDOM!.childNodes?.length).toEqual(0);
	});

	it('should not render boolean true', () => {
		render(true, rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('');
		expect(rootDOM!.childNodes?.length).toEqual(0);
	});

	it('should not render boolean false', () => {
		render(false, rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('');
		expect(rootDOM!.childNodes?.length).toEqual(0);
	});

    it('should not render children when using function children', () => {
		render(<div>{() => {}}</div>, rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('<div></div>');
	});

	it('should render NaN as text content', () => {
		render(NaN, rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('NaN');
	});

	it('should render numbers (0) as text content', () => {
		render(0, rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('0');
	});

	it('should render numbers (42) as text content', () => {
		render(42, rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('42');
	});

	it('should render strings as text content', () => {
		render('Testing, huh! How is it going?', rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('Testing, huh! How is it going?');
	});

	it('should render arrays of mixed elements', () => {
        const Foo = () => 'd';
		render([0, 'a', 'b', <span>c</span>, <Foo />, null, undefined, false, ['e', 'f'], 1], rootDOM!);
		expect(rootDOM!.innerHTML).toEqual('0ab<span>c</span>def1');
	});
})