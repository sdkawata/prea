import {h, render} from 'prea'

const root = document.createElement('div')
document.body.appendChild(root)
const App = () => {
    return (
        <div>
            Hello, prea!
        </div>
    )
}
render(<App/>, root)