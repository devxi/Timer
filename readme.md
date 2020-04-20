# Timer（浏览器+Node） 和 FrameTimer(仅浏览器端)

## 一 、基于原生setTimeout 和 setTimerInterval 封装的 定时器，api 更加友好——Timer

完全使用系统api setTimeout 以及 setTimerInterval  实现 浏览器环境和node环境均可用

### API

```typescript
  /**
   * 循环执行一次 【caller + fn】 唯一确定一个定时器
   *
   * @param {number} delay 
   * @param {*} caller this作用域
   * @param {Function} fn 定时执行的方法
   * @param {boolean} [clearBefore=true]  如果已经存在同名timer 是否清除 默认true
   * @param {*} args 定时指定的方法的参数
   * @memberof Timer
   */
public loop(delay: number, caller: any, fn: Function, clearBefore = true, ...args): void 
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
public once(delay: number, caller: any, fn: Function, clearBefore = true, ...args):void

  /**
   * 清除指定对象上的指定定时器
   *
   * @param {*} caller 
   * @param {Function} fn
   * @memberof Timer
   */
public clear(caller: any, fn: Function):void

  /**
   * 清除指定对象上的所有定时器
   *
   * @param {*} caller 执行域(this)
   * @memberof Timer
   */
public clearAll(caller: any):void
  
```
### 调用示例：

```typescript

let cat = new Cat()


//es5调用方式

//cat 每1000就饿了  无参数
timer.loop(1000, cat, cat.hungry)

//cat 没分钟要吃一次猫罐头 带参数
timer.loop(1000 * 60, cat, cat.eat, true, "猫罐头")

//一次
timer.once(1000, cat , cat.hungry)

//清除
timer.clear(cat, cat.hungry)

//清除全部
timer.clearAll(cat)

//es6箭头函数调用方式

timer.loop(1000, cat, () => {
	cat.hungry()
})

//cat 没分钟要吃一次猫罐头 带参数
timer.loop(1000 * 60, cat, () => { 
	cat.eat("猫罐头")
})
```



## 二、基于浏览器的RAF定时器——FrameTime

```typescript
//once定时器，基于浏览器帧率
public frameOnce(fps: number, caller: any, fn: Function, clearBefore = true, ...args)

//循环定时器，基于浏览器帧率
public frameLoop(fps: number, caller: any, fn: Function, clearBefore = true, ...args) 

//清除指定对象上的指定方法的定时器
public clear(caller: any, fn: Function)

//清除指定对象上的定时器
public clearAll(caller: any)

//暂停指定对象上的指定方法的定时器
public pause(caller: any, fn: Function)

//恢复指定对象上的指定方法的定时器
public resume(caller: any, fn: Function)

//暂停指定对象上的所有定时器
public pauseAll(caller: any) 

//恢复指定对象上的所有定时器
public resumeAll(caller: any) 

```

