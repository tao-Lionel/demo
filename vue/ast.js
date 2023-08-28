/**
 * @description: 实现AST解析器
 */

// 定义状态机的的状态
const state = {
  initial: 1, // 初始状态
  tagOpen: 2, // 标签开始状态
  tagName: 3, // 标签名称状态
  text: 4, // 文本状态
  tagEnd: 5, // 结束标签状态
  tagEndName: 6 // 结束标签名称状态
};

// 用于判断是否是字母
function isAlpha(char) {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
}

// 接受模板字符串作为参数，并将模板切割为Token 返回
function tokenize(str) {
  // 状态机的当前状态：初始状态
  let currentState = state.initial;
  // 用于缓存字符
  const chars = [];
  // 生成的Token 会被存储到tokens 数组中，并作为函数的返回值返回
  const tokens = [];

  // 使用while 循环开启自动机，只要str 没有被消费尽 就一直循环
  while (str) {
    // 查看第一个字符, 注意只是查看，没有消费
    const char = str[0];
    // 匹配当前状态
    switch (currentState) {
      // 状态机处于初始状态
      case state.initial:
        // 遇到字符 ‘<’
        if (char === "<") {
          // 1. 状态机切换到标签开始状态
          currentState = state.tagOpen;
          // 2. 消费字符 ‘<’
          str = str.slice(1);
        } else if (isAlpha(char)) {
          // 1. 遇到字母，切换到文本状态
          currentState = state.text;
          // 2. 将当前字母缓存到 chars 数组
          chars.push(char);
          // 3. 消费当前字符
          str = str.slice(1);
        }
        break;
      // 状态机当前处于标签开始状态
      case state.tagOpen:
        if (isAlpha(char)) {
          // 1. 遇到字母，切换到标签名称状态
          currentState = state.tagName;
          // 2. 将当前字符缓存到chars中
          chars.push(char);
          // 3. 消费当前字符
          str = str.slice(1);
        } else if (char === "/") {
          // 1. 遇到字符 '/', 切换到结束标签状态
          currentState = state.tagEnd;
          // 2. 消费当前字符
          str = str.slice(1);
        }
        break;
      // 状态机处于标签名称状态
      case state.tagName:
        if (isAlpha(char)) {
          // 1. 遇到字母，由于当前处于标签名称状态，所以不需要切换状态
          // 但是需要缓存当前字符
          chars.push(char);
          // 2. 消费当前字符
          str = str.slice(1);
        } else if (char === ">") {
          // 1. 遇到字符‘>’ 切换到初始状态
          currentState = state.initial;
          // 2. 同时创建一个标签 Token 并添加到tokens 数组中
          //  注意 此时chars 数组中缓存的字符就是标签名称
          tokens.push({
            type: "tag",
            name: chars.join("")
          });
          // 3. chars 数组的内容已经被消费完了，清空它
          chars.length = 0;
          // 4. 同时消费当前字符 >
          str = str.slice(1);
        }
        break;
      // 状态机处于文本状态
      case state.text:
        if (isAlpha(char)) {
          // 1. 遇到字母，保持状态不变，但是应该将当前字符缓存到chars 数组中
          chars.push(char);
          // 2. 消费当前字符
          str = str.slice(1);
        } else if (char === "<") {
          // 1. 如果遇到字符 < ，切换到标签开始状态
          currentState = state.tagOpen;
          // 2. 从文本状态-> 标签开始状态，此时应该创建文本Token, 并添加到tokens 数组中
          tokens.push({
            type: "text",
            content: chars.join("")
          });
          // 3. chars 数组已经消费完，清空它
          chars.length = 0;
          // 4. 消费当前字符
          str = str.slice(1);
        }
        break;
      // 状态机处于标签结束状态
      case state.tagEnd:
        if (isAlpha(char)) {
          // 1. 遇到字母，切换到结束标签名称状态
          currentState = state.tagEndName;
          // 2. 将当前字符缓存到chars 中
          chars.push(char);
          // 3. 消费当前字符
          str = str.slice(1);
        }
        break;
      // 状态机处于结束标签名称状态
      case state.tagEndName:
        if (isAlpha(char)) {
          // 1. 遇到字母，不需要切换状态, 但需要将当前字符缓存到chars
          chars.push(char);
          // 2. 消费当前字符
          str = str.slice(1);
        } else if (char === ">") {
          // 1. 遇到字符 '>', 切换到初始状态
          currentState = state.initial;
          // 2. 从结束标签名称状态-> 初始状态，应该保存结束标签名称token
          tokens.push({
            type: "tagEnd",
            content: chars.join("")
          });
          // 3. chars 数组的内容已经被消费，清空它
          chars.length = 0;
          // 4. 消费当前字符
          str = str.slice(1);
        }
        break;
    }
  }
  return tokens;
}

// 扫描Token 列表，并构建AST
function parse(str) {
  const tokens = tokenize(str);
  // 创建Root 根节点
  const root = {
    type: "Root",
    children: []
  };
  // 创建elementStack 堆栈，起初只有Root根节点
  const elementStack = [root];

  // 开启一个 while 循环扫描tokens，直到所有的Token都被扫描完
  while (tokens.length) {
    // 获取当前栈顶节点作为父节点parent
    const parent = elementStack[elementStack.length - 1];
    // 当前的Token
    const t = tokens[0];
    switch (t.type) {
      case "tag":
        // 如果当前Token 是开始标签，则创建Element 类型的AST 节点
        const elementNode = {
          type: "Element",
          tag: t.name,
          children: []
        };
        // 将其添加到父节点的children 中
        parent.children.push(elementNode);
        // 将当前节点压入栈中
        elementStack.push(elementNode);
        break;
      case "text":
        // 如果当前Token 是文本，则创建Text类型的节点
        const textNode = {
          type: "Text",
          content: t.content
        };
        // 将其添加到父节点的children中
        parent.children.push(textNode);
        break;
      case "tagEnd":
        // 遇到结束标签,将栈顶弹出
        elementStack.pop();
        break;
    }
    // 消费已经扫描过的tokens
    tokens.shift();
  }

  return root;
}

// 打印AST 中节点的信息
function dump(node, indent = 0) {
  const type = node.type;
  const desc = type === "root" ? "" : type === "Element" ? node.tag : node.content;

  console.log(`${"-".repeat(indent)}${type}: ${desc}`);

  if (node.children) {
    node.children.forEach((n) => dump(n, indent + 2));
  }
}

// 深度优先遍历AST 实现转换功能
function traverseNode(ast, context) {
  // 当前节点，ast 本身就是root节点
  context.currentNode = ast;

  const transforms = context.nodeTransforms;
  for (let i = 0; i < transforms.length; i++) {
    transforms[i](context.currentNode, context);

    // 检查当前节点是否被移除，如果被移除，直接返回
    if (!context.currentNode) return;
  }

  const children = context.currentNode.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode;
      context.childIndex = i;
      traverseNode(children[i], context);
    }
  }
}

function transform(ast) {
  const context = {
    currentNode: null, // 当前正在转换的节点
    childIndex: 0, // 当前节点在父节点的children 中的位置索引
    parent: null, // 当前正在转换节点的父节点
    replaceNode(node) {
      // 找到当前节点在父节点的children 中的位置
      // 然后使用新节点替换
      context.parent.children[context.childIndex] = node;
      // 由于当前节点已经被新节点替换掉了，因此我们需要将currentNode更改为新节点
      context.currentNode = node;
    },
    removeNode() {
      if (context.parent) {
        context.parent.children.splice(context.childIndex, 1);
        context.currentNode = null;
      }
    },
    nodeTransforms: [transformElement, transformText]
  };

  // 调用traverseNode 完成转换
  traverseNode(ast, context);

  // 打印AST信息
  console.log(dump(ast));
}

function transformElement(node) {
  if (node.type === "Element" && node.tag === "p") {
    node.tag = "h1";
  }
}

function transformText(node, context) {
  if (node.type === "Text") {
    // context.replaceNode({
    //   type: "Element",
    //   tag: "span"
    // });

    context.removeNode();
  }
}

const ast = parse(`<div><p>Vue</p><p>Template</p></div>`);
console.log(dump(ast));
transform(ast);
