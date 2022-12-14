// enum Test {
//   A,
//   B,
// }
// console.log(Test[0] === "A");
// console.log(Test[1] === "B");

const enum ReactiveFlags {
  SKIP = "__v_skip",
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  IS_SHALLOW = "__v_isShallow",
  RAW = "__v_raw",
}
console.log([ReactiveFlags.SKIP]);

interface Target {
  [ReactiveFlags.SKIP]?: boolean;
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
  [ReactiveFlags.IS_SHALLOW]?: boolean;
  [ReactiveFlags.RAW]?: any;
}

console.log(!!({ count: 1 } as Target)[ReactiveFlags.IS_SHALLOW]);
