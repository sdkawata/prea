import {VNode} from './create-element'

export interface PreaNode extends Node {
    _children?: VNode<any>
    _listeners?: {[s:string]:((e:any) => void)}
}