import {h, render, useState} from 'prea'

const root = document.createElement('div')
document.body.appendChild(root)

type TodoState = "active" | "completed"
interface TodoItem {
    id: string,
    text: string,
    state: TodoState
}

function randomStr() {
    return btoa(
        String.fromCharCode(
            ...Array.from(crypto.getRandomValues(new Uint8Array(16)))
        )
    )
}
const TodoItemView = ({
    todo,
    onTodoStateChanged,
    onDeleted
}: {
    todo: TodoItem,
    onTodoStateChanged: (s:TodoState) => void,
    onDeleted: () => void,
}) => {
    const onChange = (e) => {
        onTodoStateChanged(e.target.checked ? "completed" : "active")
    }
    return (
        <div>
            <label>
                <button onClick={onDeleted}>削除</button>
                <input
                    type="checkbox"
                    checked={todo.state === "completed"}
                    value="selected"
                    onChange={onChange}/>
                <span style={{
                    textDecoration: todo.state === "completed" ? 'line-through': '',
                }}>
                    {todo.text}
                </span>
            </label>
        </div>
    )
}

type FilterState = "all" | TodoState
const App = () => {
    const [input, setInput] = useState("")
    const [todos, setTodos] = useState<TodoItem[]>([])
    const [filter, setFilter] = useState<FilterState>("all")
    const addTodo = () => {
        setTodos([
            ...todos,
            {
                id: randomStr(),
                text: input,
                state: "active",
            }
        ])
        setInput("")
    }
    const onKeyDown = (e) => {
        if (e.keyCode !== 13) {
            return
        }
        e.preventDefault()
        addTodo()
    }
    const changeState = (id: string, newState: TodoState) => {
        setTodos(
            todos.map((todo) => (
                todo.id === id ? {...todo, state:newState} : todo
            ))
        )
    }
    const deleteTodo = (id:string) => {
        setTodos(
            todos.filter((todo) => (
                todo.id !== id
            ))
        )
    }
    const filteredTodos = todos.filter((todo) => (
        filter === "all" ? true : todo.state === filter
    ))
    const Radio = ({thisFilter,name}:{thisFilter: FilterState, name:string}) => (
        <label>
            <input
                type="radio"
                value={thisFilter}
                name="filter"
                checked={filter === thisFilter}
                onChange={(e) => setFilter(e.target.value)}/>
            {name}
        </label>
    )
    return [
        <div>
            <input
                placeholder="what needs to be done?"
                value={input}
                onInput={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}/>
            <button onClick={addTodo}>add</button>
        </div>,
        <div>
            <Radio thisFilter="all" name="all"/>
            <Radio thisFilter="active" name="active only"/>
            <Radio thisFilter="completed" name="completed only"/>
        </div>,
        filteredTodos.map((todo) => (
            <TodoItemView
            todo={todo}
            onTodoStateChanged={(state) => changeState(todo.id, state)}
            onDeleted={() => deleteTodo(todo.id)}/>
        ))
    ]
}
render(<App/>, root)