// 获取引用类型的类型 从[object xxx]中返回xxx
const objectToString = Object.prototype.toString;
const toTypeString = (value: unknown): string => {
  return objectToString.call(value);
};
const toRawType = (value: unknown) => {
  return toTypeString(value).slice(8, -1);
};

console.log(toRawType({}));
