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
  const dom = el.type === 'TEXT_ELEMENT' ? 
    document.createTextNode('') : document.createElement(el.type)
  
  Object.keys(el.props).forEach((prop)=>{
    if(prop !== 'children'){
      dom[prop] = el.props[prop]
    }
  })

  el.props.children.forEach((child)=>{
    render(child, dom)
  })

  container.append(dom)
}

export {
  createElement,
  render
}