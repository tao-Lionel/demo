function createRenderer(options) {
  const { createElement, insert, setElementText } = options;

  function shouldSetAsProps(el, key, value) {
    // 特殊处理
    if (key === "form" && el.tagName === "INPUT") return false;
    // 兜底
    return key in el;
  }

  function mountElement(vnode, container) {
    const el = (vnode.el = createElement(vnode.type));

    // 处理子节点 如果子节点是字符串 代表元素具有文本节点
    if (typeof vnode.children === "string") {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      // 如果children是数组 则遍历每一个子节点，并调用patch 函数挂载它
      vnode.children.forEach(child => {
        patch(null, child, el);
      });
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, prevValue, vnode.props[key]);
      }
    }

    // 将元素添加到容器中
    insert(el, container);
  }

  // n1 旧 n2 新
  function patch(n1, n2, container) {
    if (n1 && n1.type != n2.type) {
      // 如果新旧vnode类型不同，则吧旧的直接卸载
      unmount(n1);
      n1 = null;
    }

    const { type } = n2;

    if (typeof type === "string") {
      // 如果旧dom不存在 意味着挂载
      if (!n1) {
        mountElement(n2, container);
      } else {
        // 如果旧dom存在 意味着打补丁
      }
    } else if (typeof type === "object") {
    }
  }

  function unmount(vnode) {
    const parent = vnode.el.parentNode;
    if (parent) parent.removeChild(el);
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        // 调用unmount 函数卸载vnode
        unmount(container._vnode);
      }
    }
    container._vnode = vnode;
  }

  return {
    render,
  };
}

// 创建一个渲染器
const renderer2 = createRenderer({
  createElement(tag) {
    console.log(`创建元素 ${tag}`);
    return { tag };
  },
  setElementText(el, text) {
    console.log(`设置 ${JSON.stringify(el)} 的文本内容：${text}`);
    el.textContent = text;
  },
  insert(el, parent, anchor = null) {
    console.log(`将 ${JSON.stringify(el)} 添加到
    ${JSON.stringify(parent)} 下`);
    parent.children = el;
  },
  patchProps(el, key, prevValue, nextValue) {
    // 事件
    if (/^on/.test(key)) {
      let invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = e => {
            if ((Array.isArray(invoker.value))) {
              invoker.value.forEach(fn => fn(e));
            } else {
              invoker.value(e);
            }
          };
          invoker.value = nextValue;
          el.addEventlistener(name, invoker);
        } else {
          invoker.value = nextValue;
        }
      } else if (invoker) {
        el.removeEventListener(name, invoker);
      }
    }

    // 对class进行特殊处理
    if (key === "class") {
      el.className = nextValue || "";
    } else if (shouldSetAsProps(el, key, value)) {
      // 使用 shouldSetAsProps 函数判断是否应该作为 DOM Properties
      const type = typeof el[key];

      // 如果是布尔类型 并且value 是空字符串 则将值矫正为true
      if (type === "boolean" && value === "") {
        el[key] = true;
      } else {
        el[key] = false;
      }
    } else {
      el.setAttribute(key, vnode.props[key]);
    }
  },
});

// 虚拟dom
const vnode = {
  type: "h1",
  props: {
    id: "foo",
  },
  children: [
    {
      type: "p",
      children: "hello",
    },
  ],
};

// // 调用render 函数渲染vnode
renderer.render(vnode, document.querySelector("#app"));

const container = { type: "root" };
renderer2.render(vnode, container);
