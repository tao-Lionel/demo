const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

/**
 * @description:
 * @param {*} promise MyPromise 实例
 * @param {*} x 前一个 MyPromise resolve 出来的值
 * @param {*} resolve promise 对象构造函数中的 resolve
 * @param {*} reject promise 对象构造函数中的 reject
 */
function resolvePromise(promise, x, resolve, reject) {
  // 如果promise和x指向同一对象，以TypeError为拒因，拒绝执行promise
  if (promise === x) {
    return reject(new TypeError("Chaining cycle detected for promise #<MyPromise>"));
  }

  // 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
  let isCalled = false;

  // 如果x是对象或者函数
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 如果x.then 的取值时抛出错误e,则以e为拒因拒绝promise
    try {
      // 把x.then赋值给then
      let then = x.then;

      // 如果then是函数
      if (typeof then === "function") {
        // 则将x作为函数的作用域this调用之, 并传递两个回调函数作为参数,第一个参数叫resolvePromise，第二个叫rejectPromise
        // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
        // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
        then.call(
          x,
          y => {
            if (isCalled) return;
            isCalled = true;
            resolvePromise(promise, y, resolve, reject);
          },
          r => {
            if (isCalled) return;
            isCalled = true;
            reject(r);
          }
        );
      } else {
        // 如果 then 不是函数，以 x 为参数执行 promise
        resolve(x);
      }
    } catch (e) {
      if (isCalled) return;
      isCalled = true;
      reject(e);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x);
  }
}

class MyPromise {
  // 接受一个函数作为参数
  constructor(executor) {
    this.status = PENDING; // 初始状态是pending
    this.value = undefined; // resolve出去的值
    this.reason = undefined; // reject出去的原因
    // 维护两个列表容器 存放对应的回调
    this.onFulfilledCallbackList = [];
    this.onRejectedCallbackList = [];

    // 解决的回调
    const resolve = value => {
      // // 当 value 是 MyPromise 实例的时候
      // if (value instanceof MyPromise) {
      //   value.then(resolve, reject);

      //   // 一定要 return 否则会无限递归下去
      //   return;
      // }

      // 状态只能由pending 变为 fulfilled 或者 rejected
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;

        // 从容器中取出onFulfilled并执行
        this.onFulfilledCallbackList.forEach(fn => fn());
      }
    };

    // 拒绝的回调
    const reject = reason => {
      // 状态只能由pending 变为 fulfilled 或者 rejected
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;

        // 从容器中取出onRejected并执行
        this.onRejectedCallbackList.forEach(fn => fn());
      }
    };

    // 错误一般都是发生在executor函数中，如果报错将调用reject改变状态，并抛出错误
    try {
      // 该函数接受两个函数作为参数
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  // 接受两个参数onFulfilled和onRejected
  then(onFulfilled, onRejected) {
    // onFulfilled 和 onRejected 都是可选参数,如果没传的时候就设置默认值
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : reason => {
            throw reason;
          };

    const promise2 = new MyPromise((resolve, reject) => {
      // onFulfilled在执行结束后会被调用，第一个参数是promise的终值
      if (this.status === FULFILLED) {
        // 以宏任务的方式执行resolvePromise,保证能拿到promise2的实例
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      // onRejected在被拒绝后会被调用，第一个参数是promise的拒因
      if (this.status === REJECTED) {
        // 以宏任务的方式执行resolvePromise,保证能拿到promise2的实例
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      // 状态是pending时,存放onFulfilled和onRejected
      if (this.status === PENDING) {
        this.onFulfilledCallbackList.push(() => {
          // 以宏任务的方式执行resolvePromise,保证能拿到promise2的实例
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.onRejectedCallbackList.push(() => {
          // 以宏任务的方式执行resolvePromise,保证能拿到promise2的实例
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

// 用于测试 Promises/A+ 规范
MyPromise.defer = MyPromise.deferred = function () {
  let deferred = {};

  deferred.promise = new MyPromise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};

module.exports = MyPromise;
