import {render} from '../src/render'
import {h} from "../src/create-element"
import { setScheduleFunc } from '../src/debounce';
import * as sinon from 'sinon'

function getAttributes(node: Element) {
	let attrs = {};
	for (let i = node.attributes.length; i--; ) {
		attrs[node.attributes[i].name] = node.attributes[i].value;
	}
	return attrs;
}

describe('event', () => {
    let rootDOM: HTMLDivElement | null;
    let scheduled: (() => void)[] = []

    function fireEvent(on: HTMLElement, type: string) {
		let e = document.createEvent('Event');
		e.initEvent(type, true, true);
		on.dispatchEvent(e);
	}
    beforeEach(() => {
        rootDOM = document.createElement('div')
        document.body.appendChild(rootDOM)
        scheduled = []
        setScheduleFunc((cb: () => void) => scheduled.push(cb))
    })
    afterEach(() => {
        rootDOM?.parentNode?.removeChild(rootDOM)
        rootDOM = null
    })
    it('registered event called', () => {
		let click = sinon.spy();

		render(<div onclick={() => click(1)}/>, rootDOM!);

		fireEvent(rootDOM!.childNodes[0] as HTMLElement, 'click');
        expect(click.calledOnce).toEqual(true)
	});
})