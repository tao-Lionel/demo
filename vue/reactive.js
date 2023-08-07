/**
 * @description: 实现响应式
 */

// 测试数据
const data = { foo: 1, bar: 2 };

// 存储副作用函数的‘桶’
const bucket = new WeakMap();

// 用一个全局变量存储被注册的副作用函数
let activeEffect;
// 兼容嵌套的effect
const effectStack = [];

function effect(fn, options = {}) {
  const effectFn = () => {
    // 调用cleanup 函数 完成清楚工作
    cleanup(effectFn);
    // 当 effectFn 执行时，将其设置为当前激活的副作用函数
    activeEffect = effectFn;
    // 在调用副作用函数之前，将当前副作用函数压入栈中
    effectStack.push(effectFn);
    // 将 fn 的执行结果存储到res 中
    const res = fn();
    // 在当前副作用函数执行完成后，将当前副作用函数弹出栈，并把activeEffect 还原为之前的值
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    // 将res 作为effectFn的返回值
    return res;
  };
  // 将options 挂载到effectFn上
  effectFn.options = options;
  // activeEffect.deps 用来存贮所有与该副作用函数相关的依赖集合
  effectFn.deps = [];
  if (!options.lazy) {
    // 执行副作用函数
    effectFn();
  }

  return effectFn;
}

// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数activeEffect 添加到存贮副作用函数的桶中
    track(target, key);
    // 返回属性值
    return target[key];
  },

  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal;
    // 把副作用函数从桶中取出并执行
    trigger(target, key);
  }
});

// 在get拦截函数内调用 track函数追踪变化
function track(target, key) {
  // 如果没有activeEffect 直接return
  if (!activeEffect) {
    return target[key];
  }

  // 根据target从桶中取得depsMap,它也是一个Map类型： key-> effects
  let depsMap = bucket.get(target);
  // 如果不存在depsMap,那么新建一个Map 并与 target关联
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }

  // 再根据key 从 depsMap 中取得 deps, 他是一个Set类型
  // 里面存贮着与当前key相关联的effects
  let deps = depsMap.get(key);
  // 如果deps 不存在，同样新建一个set并与key 关联
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }

  // 最后将当前激活的副作用函数添加到桶里
  deps.add(activeEffect);
  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到 activeEffect.deps数组中
  activeEffect.deps.push(deps);
}

// 在set拦截函数中调用用trigger函数触发变化
function trigger(target, key) {
  // 根据target从桶中取得depsMap，他是key->effects
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  // 根据key 取得所有副作用函数 effect
  const effects = depsMap.get(key);
  // 执行副作用函数
  // 创建一个新的Set集合，避免无限调用
  const effectsToRun = new Set();
  effects &&
    effects.forEach((effectFn) => {
      // 如果trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  effectsToRun.forEach((effectFn) => {
    // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      // 否则直接执行副作用函数
      effectFn();
    }
  });
  // effects && effects.forEach((fn) => fn());
}

function cleanup(effectFn) {
  // 遍历effectFn.deps数组
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i];
    // 将effectFn从依赖集合中删除
    deps.delete(effectFn);
  }
  // 最后需要重置effect.deps数组
  effectFn.deps.length = 0;
}

// 调度器
// 定义一个任务队列
const jobQueue = new Set();
// 使用promise.resolve() 创建一个Promise实例，我们用它将一个任务添加到微任务队列
const p = Promise.resolve();

// 一个标志代表是否正在刷新队列
let isFlushing = false;
function flushJob() {
  // 如果队列正在刷新，则什么都不做
  if (isFlushing) return;
  // 设置为true,代表正在刷新
  isFlushing = true;
  // 在微任务队列中刷新jobQueue 队列
  p.then(() => {
    jobQueue.forEach((job) => job());
  }).finally(() => {
    isFlushing = false;
  });
}

// 实现计算属性
function computed(getter) {
  // value 用来缓存上一次计算的值
  let value;
  // 用来标识是否需要重新计算值，为true则意味着'脏'，需要计算
  let dirty = true;

  // 把getter 作为副作用函数，创建一个lazy 的 effect
  const _effectFn = effect(getter, {
    lazy: true,
    // 添加调度器，在调度器中将dirty 重置为true
    scheduler() {
      dirty = true;
      // 当计算属性依赖的响应式数据变化时，手动调用trigger 函数触发响应
      trigger(obj, "value");
    }
  });

  const obj = {
    // 当读取value 时才执行 effectFn
    get value() {
      // 只有'脏'时才计算值，并将值缓存到value中
      if (dirty) {
        value = _effectFn();
        // 将dirty 设置为false,下一次访问直接用缓存到value 中的值
        dirty = false;
      }
      // 当读取value时，手动调用track 函数进行追踪
      track(obj, "value");
      return value;
    }
  };
  return obj;
}

// const sumRes = computed(() => obj.foo + obj.bar);

// effect(() => {
//   console.log(sumRes.value);
// });

// obj.foo++;

// watch 实现原理
function watch(source, cb, options = {}) {
  let getter;
  // 如果source 是函数，说明用户传递的是getter,所以直接把source赋值给getter
  if (typeof source === "function") {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  // 定义旧值与新值
  let oldValue, newValue;

  // cleanup 来存贮过期的回调
  let cleanup;
  // 定义onInvalidate 函数
  function onInvalidate(fn) {
    cleanup = fn;
  }

  const job = () => {
    // 在scheduler 中重新执行副作用函数，得到的是新值
    newValue = _effectFn();
    // 在调用回调函数cb之前，先调用过期回调
    if (cleanup) {
      cleanup();
    }
    // 将旧值和新值作为回调函数的参数
    cb(newValue, oldValue, 定义onInvalidate);
    // 更新旧值，不然下一次会得到错误的旧值
    oldValue = newValue;
  };

  // 使用effect 注册副作用函数时，开启lazy选项，并把返回值存储到effectFn中，以便后续手动调用
  const _effectFn = effect(
    // 调用traverse 递归地读取
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        // 在调度函数中判断flush是否为'post'，如果是，将其放到微任务队列中执行
        if (options.flush === "post") {
          const p = Promise.resolve();
          p.then(job);
        } else {
          job();
        }
      }
    }
  );

  if (options.immediate) {
    // 立即执行job,从而触发回调执行
    job();
  } else {
    // 手动调用副作用函数，拿到的值就是旧值
    oldValue = _effectFn();
  }
}

function traverse(value, seen = new Set()) {
  // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return;
  }
  // 将数据添加到seen 中，代表遍历地读取过了，避免循环引用引起的死循环
  seen.add(value);
  // 暂时不考虑数组等其他结构
  // 假设value 就是一个对象，使用for in 读取对象的每一个值，并递归的调用traverse
  for (const k in value) {
    traverse(value[k], seen);
  }

  return value;
}

watch(
  () => obj.foo,
  (newValue, oldValue) => {
    console.log("obj.foo的值变了", newValue, oldValue);
  },
  {
    immediate: true
  }
);
obj.foo++;
