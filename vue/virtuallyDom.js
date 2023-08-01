// 虚拟dom
const vnode = {
  tag: "div",
  props: {
    onClick: () => alert("hello")
  },
  children: "click me"
};

function renderer(vnode, contain) {
  // 根据tag创建一个DOM元素
  let el = document.createElement(vnode.tag);

  // 遍历props 属性
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      el.addEventListener(key.substr(2).toLowerCase(), vnode.props[key]);
    }
  }

  if (typeof vnode.children === "string") {
    // 如果是字符串 说明是文本节点
    el.appendChild(document.createTextNode(vnode.children));
  } else if (Array.isArray(vnode.children)) {
    // 递归调用
    vnode.children.forEach((child) => renderer(child, el));
  }
}

renderer(vnode, document.body);
