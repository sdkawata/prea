import {render} from '../src/render'
import {h, VNode} from "../src/create-element"
import { setScheduleFunc } from '../src/debounce';
import { useState } from '../src/hooks';

function getAttributes(node: Element) {
	let attrs = {};
	for (let i = node.attributes.length; i--; ) {
		attrs[node.attributes[i].name] = node.attributes[i].value;
	}
	return attrs;
}

describe('useState()', () => {
    let rootDOM: HTMLDivElement | null;
    let scheduled: (() => void)[] = []
    const rerender = () => {
        scheduled.map((cb) => cb())
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
    it('useState cause render', () => {
        let setter;
        const F = () => {
            const [i, setI] = useState(1)
            setter = setI
            return <div>{i}</div>
        }
        render(<F/>, rootDOM!)
        expect(rootDOM!.innerHTML).toEqual('<div>1</div>')
        setter(99)
        expect(scheduled.length).toEqual(1)
        rerender()
        expect(rootDOM!.innerHTML).toEqual('<div>99</div>')
    })
})