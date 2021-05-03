import { Component } from "./create-element"
import { registerRenderEnterCB, registerRenderExitCB, enqueueRender } from "./render"

let componentsStack: (Component<any>[]) = []
let currentIndex = 0
function getCurrentComponent() {
    return componentsStack[componentsStack.length - 1]
}

registerRenderEnterCB((c) => {
    componentsStack.push(c)
    currentIndex = 0
})
registerRenderExitCB((c) => {
    componentsStack.pop()
})

type StateOrUpdater<S> =  S | ((s:S) => S)
function getNextState<S>(current:S, updater:StateOrUpdater<S>):S {
    if (typeof updater === 'function') {
        return (updater as ((s:S) => S)) (current)
    } else {
        return updater
    }
}
export function useState<S>(initialState:S): [
    S,
    (s:StateOrUpdater<S>) => void
] {
    const component = getCurrentComponent()
    const hookStates = component._hookStates || (component._hookStates = [])
    const stateIndex = currentIndex++
    return [
        hookStates[stateIndex] = hookStates[stateIndex] || initialState,
        (updater) => {
            hookStates[stateIndex] = getNextState(hookStates[stateIndex], updater)
            enqueueRender(component)
        }
    ]
}
