type CB = () => void

let scheduleFunc = (cb: CB) => {
    Promise.resolve().then(cb)
}
let scheduled: CB[] = []
export function schedule(cb:CB) {
    if (scheduled.find((e) => cb === e)) {
        return
    }
    scheduled.push(cb)
    scheduleFunc(() => {
        scheduled = scheduled.filter((e) => cb !== e)
        cb()
    })
}
export function setScheduleFunc(newScheduleFunc: (cb:CB) => void) {
   scheduleFunc = newScheduleFunc
}