function createElement(type, props, ...children){
  return {
    type,
    props: {
      ...props,
      children: children.map((child)=>{
        return typeof child === 'string' ? createTextNode(child) : child
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

function render(el, container){
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
  // const dom = el.type === 'TEXT_ELEMENT' ? 
  //   document.createTextNode('') : document.createElement(el.type)
  
  // Object.keys(el.props).forEach((prop)=>{
  //   if(prop !== 'children'){
  //     dom[prop] = el.props[prop]
  //   }
  // })

  // el.props.children.forEach((child)=>{
  //   render(child, dom)
  // })

  // container.append(dom)
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
  
  requestIdleCallback(workLoop)
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
function initChildren(fiber){
  const children = fiber.props.children
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

  if(!fiber.dom){
    // 1. 创建dom
    const dom =  (fiber.dom = createDom(fiber.type))

    // 添加节点
    fiber.parent.dom.append(dom)

    // 2. 执行props赋值属性
    updateProps(dom, fiber.props)
  }

  // 3. 转换链表，映射对应节点关系【child、sibling，叔叔【parent.sibling】】
  initChildren(fiber)

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