// 虚拟dom
// const vnode = {
//   tag: "div",
//   props: {
//     onClick: () => alert("hello"),
//     class: "test test1",
//   },
//   children: "click me",
// };
// 组件dom
const MyComponent = function () {
  return {
    tag: "div",
    props: {
      onClick: () => alert("hello"),
    },
    children: "click me component",
  };
};

const vnode = {
  tag: MyComponent,
};

function renderer(vnode, contain) {
  if (typeof vnode.tag === "string") {
    mountElement(vnode, contain);
  } else if (typeof vnode.tag === "function") {
    mountComponent(vnode, contain);
  }
}

function mountElement(vnode, contain) {
  // 根据tag创建一个DOM元素
  let el = document.createElement(vnode.tag);

  // 遍历props 属性
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      el.addEventListener(key.substr(2).toLowerCase(), vnode.props[key]);
    } else if (key === "class") {
      el.className = vnode.props[key];
    }
  }

  if (typeof vnode.children === "string") {
    // 如果是字符串 说明是文本节点
    el.appendChild(document.createTextNode(vnode.children));
  } else if (Array.isArray(vnode.children)) {
    // 递归调用
    vnode.children.forEach(child => renderer(child, el));
  }

  contain.appendChild(el);
}

function mountComponent(vnode, contain) {
  // 调用组件函数 获取组件要渲染的内容（虚拟dom）
  const subtree = vnode.tag();
  // 递归调用renderer渲染subtree
  renderer(subtree, contain);
}

renderer(vnode, document.body);