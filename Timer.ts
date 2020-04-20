import Utils from "./Utils"


enum TimerLoopType {
  Once = 0,
  Loop = 1
}

class FrameTimerVO {
  fn     : Function      = null
  type   : TimerLoopType = null
  paused : boolean       = null
  elapsed: number        = null
  delay  : number        = null
  constructor(fn: Function, type: TimerLoopType, delay: number) {
    this.fn      = fn
    this.type    = type
    this.delay   = delay 
    this.paused  = false
    this.elapsed = 0
  }
}

/**
 * 基于setTimeout 和 setTimeInterval 封装的定时器
 * @author nothing
 * @class Timer
 */
class Timer {
  /*
  caller:any
  fn:Function
  timer:numer
  结构  { caller_GID: { MD5_KEY:timer } }
  */
  private caller_times        = {}
  public  static showDebugLog = false


  /**
   * 循环执行 【caller + fn】 唯一确定一个定时器⏲️
   *
   * @param {number} delay
   * @param {*} caller this作用域
   * @param {Function} fn 定时执行的方法 
   * @param {boolean} [clearBefore=true] 如果已经存在同名timer 是否清除 默认trueßß
   * @param {*} args 定时指定的方法的参数
   * @memberof Timer
   */
  public loop(delay: number, caller: any, fn: Function, clearBefore = true, ...args): void {
    let callerKey = getCallerGID(caller)
    let timeKey = getSignKey(caller, fn)
    if (clearBefore) {
      this.clear(caller, fn)
    }
    this.caller_times[callerKey] = this.caller_times[callerKey] || {}
    this.caller_times[callerKey][timeKey] = setInterval(fn.bind(caller), delay, ...args)
    log("增加一个☝️loop定时器 id:", `${caller}-${timeKey}`)
  }


  /**
   * 定时执行一次 【caller + fn】 唯一确定一个定时器
   *
   * @param {number} delay 
   * @param {*} caller this作用域
   * @param {Function} fn 定时执行的方法
   * @param {boolean} [clearBefore=true]  如果已经存在同名timer 是否清除 默认true
   * @param {*} args 定时指定的方法的参数
   * @memberof Timer
   */
  public once(delay: number, caller: any, fn: Function, clearBefore = true, ...args) {
    let callerKey = getCallerGID(caller)
    let timeKey = getSignKey(caller, fn)
    if (clearBefore) {
      this.clear(caller, fn)
    }
    this.caller_times[callerKey] = this.caller_times[callerKey] || {}
    this.caller_times[callerKey][timeKey] = setTimeout(fn.bind(caller), delay, ...args)
    log("增加一个☝️once定时器 id:", `${caller}-${timeKey}`)
  }

  /**
   * 清除指定对象上的指定定时器
   *
   * @param {*} caller 
   * @param {Function} fn
   * @memberof Timer
   */
  public clear(caller: any, fn: Function) {
    let callerKey = getCallerGID(caller)
    let timeKey = getSignKey(caller, fn)
    if (this.caller_times[callerKey]) {
      let timer = this.caller_times[callerKey][timeKey]
      if (!timer) {
        return
      }
      clearInterval(timer)
      delete this.caller_times[callerKey][timeKey]
      if (0 == Utils.getObjLen(this.caller_times[callerKey])) {
        delete this.caller_times[callerKey]
      }
      log("清除一个定时器 id:", `${caller}-${timeKey}`)
    }
  }

  /**
   * 清除指定对象上的所有定时器
   *
   * @param {*} caller 执行域(this)
   * @memberof Timer
   */
  public clearAll(caller: any) {
    let callerKey = getCallerGID(caller)
    if (!this.caller_times[callerKey]) {
      return
    }
    let count = 0
    for (const key in this.caller_times[callerKey]) {
      const timer = this.caller_times[callerKey][key]
      clearInterval(timer)
      count++
    }
    this.caller_times[callerKey] = {}
    delete this.caller_times[callerKey]
    log("清除所有定时器⏲️ count", count)
  }
}



class AnimationFrame {
  private auto(elapsed: number, timer: FrameTimer) {
    timer.tick(elapsed - timer.stamp)
    timer.stamp = elapsed
    timer.id = requestAnimationFrame((elapsed: number) => this.auto(elapsed, timer))
  }
  public enable(timer: FrameTimer) {
    timer.paused = false
    timer.stamp = 0
    timer.id = requestAnimationFrame((elapsed) => this.auto(elapsed, timer))
  }
  public disable(timer) {
    cancelAnimationFrame(timer.id)
  }
}

// 原生RAF
const RAF = new AnimationFrame()

//基于屏幕帧率的定时器 在 浏览器 tab 失去焦点 或者手机浏览器 退到后台后，会暂停计时
class FrameTimer {

  /**
   * 是否暂停
   *
   * @type {boolean}
   * @memberof FrameTimer
   */
  paused: boolean
  queue : Map<any, any>
  stamp : number
  id    : number
  private caller_times: { [callerGID: string]: { [md5: string]: FrameTimerVO } } = {}
  // 构造函数
  constructor() {
    // 暂停状态 - 这是个公共状态，由外部 Ticker 决定
    this.paused = true
    // 开启 RAF
    RAF.enable(this)
  }

  public frameOnce(fps: number, caller: any, fn: Function, clearBefore = true, ...args) {
    let callerKey = getCallerGID(caller)
    let timeKey = getSignKey(caller, fn)
    if (clearBefore) {
      this.clear(caller, fn)
    }
    this.caller_times[callerKey] = this.caller_times[callerKey] || {}
    let timer: FrameTimerVO = new FrameTimerVO(fn.bind(caller, ...args), TimerLoopType.Once, fps)
    this.caller_times[callerKey][timeKey] = timer
    log("增加一个frame once定时器⏲️", `${caller}-${timeKey}`)
  }

  public frameLoop(fps: number, caller: any, fn: Function, clearBefore = true, ...args) {
    let callerKey = getCallerGID(caller)
    let timeKey = getSignKey(caller, fn)
    if (clearBefore) {
      this.clear(caller, fn)
    }
    this.caller_times[callerKey] = this.caller_times[callerKey] || {}
    let timer: FrameTimerVO = new FrameTimerVO(fn.bind(caller, ...args), TimerLoopType.Loop, fps)
    this.caller_times[callerKey][timeKey] = timer
    log("增加一个frame loop定时器⏲️", `${caller}-${timeKey}`)
  }

  public clear(caller: any, fn: Function) {
    let callerKey = getCallerGID(caller)
    let timeKey = getSignKey(caller, fn)
    if (this.caller_times[callerKey]) {
      let timer = this.caller_times[callerKey][timeKey]
      if (!timer) {
        return
      }
      delete this.caller_times[callerKey][timeKey]
      if (0 == Utils.getObjLen(this.caller_times[callerKey])) {
        delete this.caller_times[callerKey]
      }
    }
  }

  public clearAll(caller: any) {
    let callerKey = getCallerGID(caller)
    if (!this.caller_times[callerKey]) {
      return
    }
    let count = Utils.getObjLen(this.caller_times[callerKey])
    this.caller_times[callerKey] = {}
    delete this.caller_times[callerKey]
    log("清除所有frame 定时器⏲️ count", count)
  }


  public pause(caller: any, fn: Function) {
    let callerKey = getCallerGID(caller)
    let timeKey = getSignKey(caller, fn)
    if (!this.caller_times[callerKey]) return
    if (!this.caller_times[callerKey][timeKey]) return
    let timer = this.caller_times[callerKey][timeKey]
    timer.paused = true
  }


  public resume(caller: any, fn: Function) {
    let callerKey = getCallerGID(caller)
    let timeKey = getSignKey(caller, fn)
    if (!this.caller_times[callerKey]) return
    if (!this.caller_times[callerKey][timeKey]) return
    let timer = this.caller_times[callerKey][timeKey]
    timer.paused = false
  }

  // 暂停全部
  public pauseAll(caller: any) {
    let callerKey = getCallerGID(caller)
    if (!this.caller_times[callerKey]) return
    for (const timerKey in this.caller_times[callerKey]) {
      const timer = this.caller_times[callerKey][timerKey]
      timer.paused = true
    }
  }

  public resumeAll(caller: any) {
    let callerKey = getCallerGID(caller)
    if (!this.caller_times[callerKey]) return
    for (const timeKey in this.caller_times[callerKey]) {
      const timer = this.caller_times[callerKey][timeKey]
      timer.paused = false
    }
  }

  /**
   * 请不要手动调用此方法
   *
   * @private
   * @param {*} delta
   * @memberof FrameTimer
   */
  public tick(delta) {
    this.paused || this.timerTick(delta)
  }

  private timerTick(delta: number) {
    for (const callerKey in this.caller_times) {
      const timeKeys = this.caller_times[callerKey]
      for (const timeKey in timeKeys) {
        const timer = this.caller_times[callerKey][timeKey]
        if (timer.paused) return
        timer.elapsed += delta
        if (timer.elapsed >= timer.delay) {
          timer.fn()
          timer.type === TimerLoopType.Once ? delete this.caller_times[callerKey][timeKey] : timer.elapsed = 0
        }
      }
    }
  }
}

function log(...args): void {
  if (Timer.showDebugLog) {
    console.log("[Timer⏲️]->", ...args)
  }
}

function getSignKey(caller: any, fn: Function): string {
  return Utils.getMD5(Utils.getObjectGID(caller) + fn)
}

function getCallerGID(caller: any): string {
  return Utils.getObjectGID(caller)
}

const timer = new Timer()
const frameTimer = new FrameTimer()

export {
  timer,
  frameTimer
}


