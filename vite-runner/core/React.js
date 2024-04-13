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




let wipRoot = null // wipRoot ===> workIn
let currentRoot = null
function render(el, container){
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }
  nextWorkOfUnit = wipRoot
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
  // 集中渲染节点 [wipRoot 仅仅添加一次，因为任务调度器会执行多次]
  if(!nextWorkOfUnit && wipRoot){
    commitRoot()
  }
  
  requestIdleCallback(workLoop)
}

let deletions = []

// 渲染节点
function commitRoot(){
  deletions.forEach(commitDeletion)
  deletions = []
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitDeletion(fiber){
  if(fiber.dom){
    let fiberParent = fiber.parent
    while(!fiberParent.dom){
      fiberParent = fiberParent.parent
    }
    fiberParent.dom.removeChild(fiber.dom)
  }else{
    commitDeletion(fiber.child)
  }
}

function commitWork(fiber){
  if(!fiber) return
  let fiberParent = fiber.parent
  while(!fiberParent.dom){
    fiberParent = fiberParent.parent
  }

  // 放在这里更新props
  if(fiber.effectTag === 'update'){
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  }else if(fiber.effectTag === 'placement'){
    if(fiber.dom) fiberParent.dom.append(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// 创建dom
function createDom(type){
  return type === 'TEXT_ELEMENT' ? 
  document.createTextNode('') : document.createElement(type)
}

// 执行props赋值属性
function updateProps(dom, nextProps, prevProps){
  // 1. old的有，new的没有==》删除
  Object.keys(prevProps).forEach((prevKey)=>{
    if(prevKey !== 'children'){
      // 自己的写法
      // if(!Object.keys(nextProps).includes(prevKey)){
      //   dom.removeAttribute(prevKey)
      // }
      if(!(prevKey in nextProps)){
        dom.removeAttribute(prevKey)
      }
    }
  })

  // 2. new有，old没有===>添加
  // 3. new有，old有==》修改
  Object.keys(nextProps).forEach((key)=>{
    if(key !== 'children'){
      if(nextProps[key] !== prevProps[key]){
        if(key.startsWith('on')){
          const eventType = key.slice(2).toLocaleLowerCase()
          // TODO： 不理解，解决点击触发多次的bug的
          dom.removeEventListener(eventType, prevProps[key])
          dom.addEventListener(eventType, nextProps[key])
        } else{
          dom[key] = nextProps[key]
        }
      }
    }
  })
}

// 转换成链表
function reconcileChildren(fiber, children){
  let prevChild = null

  // 这是各公用的initChildren方法，再render的时候是没有alternate的，但在update的时候有
  let oldFiber = fiber.alternate?.child
  children.forEach((child, index)=>{
    let newFiberItem
    const isSameType = oldFiber && oldFiber.type === child.type
    if(isSameType){
      // update
      newFiberItem = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'update'
      }
    }else{
      if(child){
        newFiberItem = {
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          dom: null,
          effectTag: 'placement'
        }
      }

      if(oldFiber) {
        deletions.push(oldFiber)
      }
    }
    // 不需要找叔叔节点吗====因为这里遍历子节点
    if(oldFiber){
      oldFiber = oldFiber.sibling
    }
    if(index === 0){
      fiber.child = newFiberItem
    }else{
      prevChild.sibling = newFiberItem
    }
    if(newFiberItem){
      prevChild = newFiberItem
    }
  })

  while(oldFiber){
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

// 更新functionComponent
function updateFunctionComponent(fiber){
  // **function component 不创建dom**
  
  // 3. 转换链表，映射对应节点关系【child、sibling，叔叔【parent.sibling】】
  // **function component 的children结构不在自身的属性上 ，而在其type调用之后的结构里面**
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

// 更新常规节点
function updateHostComponent(fiber){
  if(!fiber.dom){
    // 1. 创建dom
    const dom =  (fiber.dom = createDom(fiber.type))

    // 添加节点
    // fiber.parent.dom.append(dom)

    // 2. 执行props赋值属性
    updateProps(dom, fiber.props, {})
  }  

  // 3. 转换链表，映射对应节点关系【child、sibling，叔叔【parent.sibling】】
  const children = fiber.props.children
  reconcileChildren(fiber, children)
}


// 返回下一个需要执行的任务
function performWorkOfUnit(fiber){

  const isFunctionComponent = typeof fiber.type === 'function'
  if(isFunctionComponent ) {
    // console.log(fiber, '===>')
    // console.log(fiber.type(fiber.props), fiber)
    // console.log(fiber.props, '组件支持传参，参数是到props中的')
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // 4. 返回下一个需要渲染的节点
  if(fiber.child) return fiber.child
  // ** 支持function component 改造逻辑 [由于引入function component , 叔叔节点获取规则需要层层向上遍历]**
  // if(fiber.sibling) return fiber.sibling
  let newFiber = fiber
  while(newFiber){
    if(newFiber.sibling) return newFiber.sibling
    newFiber = newFiber.parent
  }
  // return fiber.parent?.sibling
}

requestIdleCallback(workLoop)


function update(){
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }
  nextWorkOfUnit = wipRoot
}



const React = {
  update,
  createElement,
  render
}

export default React