// v1
// const dom = document.createElement('div');
// dom.id = 'app';
// document.getElementById("root").append(dom)

// const text = document.createTextNode('');
// text.nodeValue = "app11"
// dom.append(text)


// v2： 引入虚拟dom的方式实现效果
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

// v2：硬编码结合对象实现
// const text = createTextNode('app2')
// const dom = createElement('div', {id: 'app'}, text)
// console.log(dom)

// const domNode = document.createElement(dom.type);
// domNode.id = dom.props.id;
// document.getElementById("root").append(domNode)

// const textNode = document.createTextNode('');
// textNode.nodeValue = text.props.nodeValue
// domNode.append(textNode)

// v3 三步走创建生成
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

const dom = createElement('div', {id: 'app'}, 'app6', ' text')

render(dom, document.getElementById('root'))
