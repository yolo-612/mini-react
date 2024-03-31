import React from "./core/React.js"

// js写法
// const App = React.createElement('div', {id: 'app'}, 'app6', ' text1212')

// 这里怎么触发React的api了？？？？？ ===> jsx文件编译静默触发
function App (){
  return <div>
  hi- jiangjiang yolo612
  <AppOne num={10}></AppOne>
  12299
  </div>
}

// ===》 打印一下看看

// 打印结果===> 说明编译的时候就做了这个事情

// ƒ AppOne() {
//   return /* @__PURE__ */ React.createElement("div", { id: "1212" }, "12899", /* @__PURE__ */ React.createElement("div", { id: "hihi" }, "hihi"));
// } 


let count = 10
let props = { id: 'xxxxxxxxxxxxxxx'}
function AppOne({num}){
  // update测试
  function handleClick(){
    console.log('event click')
    count++
    props = {}
    React.update()
  }

  return <div {...props}>
    12899: {num}
    test update Props: { count }
    <button onClick={handleClick}>点击</button>
  </div>
}

function AppOneContainer(){
  return <AppOne></AppOne>
}

// console.log(AppOne, '===>')

export default App