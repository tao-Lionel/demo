

function createRenderer(options) {
    const { createElement, insert, setElementText } = options


    function mountElement(vnode, container) {
        const el = createElement(vnode.type)

        // 处理子节点 如果子节点是字符串 代表元素具有文本节点
        if (typeof vnode.type.children === 'string') {
            setElementText(e, vnode.children)
        }

        // 将元素添加到容器中
        insert(el, container)

    }

    // n1 旧 n2 新
    function patch(n1, n2, container) {

        // 如果旧dom不存在 意味着挂载
        if (!n1) {
            mountElement(n2, container)
        }
        else {
            // 如果旧dom存在 意味着打补丁

        }
    }

    function render(vnode, container) {
        if (vnode) {
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                container.innerHtml = ''
            }
        }
        container._vnode = vnode
    }

    return {
        render
    }
}


// 创建一个渲染器
const renderer = createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    }
})



const renderer2 = createRenderer({
    createElement(tag) {
        console.log(`创建元素 ${tag}`)
        return { tag }
    },
    setElementText(el, text) {
        console.log(`设置 ${JSON.stringify(el)} 的文本内容：${text}`)
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        console.log(`将 ${JSON.stringify(el)} 添加到
    ${JSON.stringify(parent)} 下`)
        parent.children = el
    }
})
const vnode = {
    type: 'h1',
    children: 'hello'
}


// // 调用render 函数渲染vnode
renderer.render(vnode, document.querySelector('#app'))

const container = { type: 'root' }
renderer2.render(vnode, container)