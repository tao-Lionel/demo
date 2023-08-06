// 实现响应式

// 存储副作用函数的‘桶’
const bucket = new WeakMap();

// 原始数据
const data = { text: "hello world", text1: "abc" };

let activeEffect = null;

function effect(fn) {
  activeEffect = fn;
  fn();
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
  },
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
}

// 在set拦截函数中调用用trigger函数触发变化
function trigger(target, key) {
  // 根据taget从桶中取得depsMap，他是key->effects
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  // 根据key 取得所有副作用函数 effect
  const effects = depsMap.get(key);
  // 执行副作用函数
  effects && effects.forEach(fn => fn());
}

effect(function effect1() {
  console.log("1111111");
  document.body.innerHTML = obj.text;
});

// effect(function effect2() {
//     document.body.innerHTML = obj.text1
// })

setTimeout(() => {
  obj.noText = "hello vue3";
}, 1000);

// setTimeout(() => {
//     obj.text1 = 'hello vue1111'
// }, 1000);
