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

// 返回下一个需要执行的任务
function performWorkOfUnit(work){

  if(!work.dom){
    // 1. 创建dom
    const dom = ( work.dom = work.type === 'TEXT_ELEMENT' ? 
      document.createTextNode('') : document.createElement(work.type))

    // 添加节点
    work.parent.dom.append(dom)

    // 2. 执行props赋值属性
    Object.keys(work.props).forEach((prop)=>{
      if(prop !== 'children'){
        dom[prop] = work.props[prop]
      }
    })
  }

  // 3. 转换链表，映射对应节点关系【child、sibling，叔叔【parent.sibling】】
  const children = work.props.children
  let preWorkItem = null

  children.forEach((child, index)=>{
    const newWorkItem = {
      type: child.type,
      props: child.props,
      child: null,
      parent: work,
      sibling: null,
      dom: null
    }
    if(index === 0){
      work.child = newWorkItem
    }else{
      preWorkItem.sibling = newWorkItem
    }
    preWorkItem = newWorkItem
  })

  // 4. 返回下一个需要渲染的节点
  if(work.child) return work.child
  if(work.sibling) return work.sibling
  return work.parent?.sibling
}

requestIdleCallback(workLoop)


const React = {
  createElement,
  render
}

export default React