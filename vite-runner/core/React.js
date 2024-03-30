function createElement(type, props, ...children){
  return {
    type,
    props: {
      ...props,
      children: children.map((child)=>{
        const isTextNode = typeof child === 'string'  || typeof child === 'number'
        return isTextNode ? createTextNode(child) : child
      })
    }
  }
}

function createTextNode (text){
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

let root = null
function render(el, container){
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
  root = nextWorkOfUnit
}

// 这个是替换 之前递归的过程的
let nextWorkOfUnit = null
function workLoop(deadline){

  let shouldYield = false;

  while(!shouldYield && nextWorkOfUnit){
    // 开始执行work任务
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    shouldYield = deadline.timeRemaining() < 1
  }
  // 集中渲染节点 [root 仅仅添加一次，因为任务调度器会执行多次]
  if(!nextWorkOfUnit && root){
    commitRoot()
  }
  
  requestIdleCallback(workLoop)
}

// 渲染节点
function commitRoot(){
  commitWork(root.child)
  root = null
}

function commitWork(fiber){
  if(!fiber) return
  let fiberParent = fiber.parent
  while(!fiberParent.dom){
    fiberParent = fiberParent.parent
  }
  if(fiber.dom) fiberParent.dom.append(fiber.dom)
  
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// 创建dom
function createDom(type){
  return type === 'TEXT_ELEMENT' ? 
  document.createTextNode('') : document.createElement(type)
}

// 执行props赋值属性
function updateProps(dom, props){
  Object.keys(props).forEach((prop)=>{
    if(prop !== 'children'){
      dom[prop] = props[prop]
    }
  })
}

// 转换成链表
function initChildren(fiber, children){
  let prevChild = null

  children.forEach((child, index)=>{
    const newFiberItem = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
      dom: null
    }
    if(index === 0){
      fiber.child = newFiberItem
    }else{
      prevChild.sibling = newFiberItem
    }
    prevChild = newFiberItem
  })
}


// 返回下一个需要执行的任务
function performWorkOfUnit(fiber){

  const isFunctionComponent = typeof fiber.type === 'function'
  if(isFunctionComponent ) {
    console.log(fiber, '===>')
    console.log(fiber.type(fiber.props), fiber)
    console.log(fiber.props, '组件支持传参，参数是到props中的')
  }
  // **function component 不创建dom**
  if(!isFunctionComponent){
    if(!fiber.dom){
      // 1. 创建dom
      const dom =  (fiber.dom = createDom(fiber.type))
  
      // 添加节点
      // fiber.parent.dom.append(dom)
  
      // 2. 执行props赋值属性
      updateProps(dom, fiber.props)
    }  
  } 
  
  // 3. 转换链表，映射对应节点关系【child、sibling，叔叔【parent.sibling】】
  // **function component 的children结构不在自身的属性上 ，而在其type调用之后的结构里面**
  const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children
  initChildren(fiber, children)

  // 4. 返回下一个需要渲染的节点
  if(fiber.child) return fiber.child
  if(fiber.sibling) return fiber.sibling
  return fiber.parent?.sibling
}

requestIdleCallback(workLoop)


const React = {
  createElement,
  render
}

export default React