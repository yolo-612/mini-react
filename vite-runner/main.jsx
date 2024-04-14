// import ReactDOM from "./core/ReactDom.js"
// import App from "./App.jsx"
// import React from "../core/React.js"

// console.log(App, 'main===>')
// ReactDOM.createRoot(document.getElementById('root')).render()

// 会报错：
// Uncaught DOMException: Failed to execute 'createElement' on 'Document': The tag name provided ('[object Object]') is not a valid name.
// 因为App生成的是一个对象 ===> 没有支持function component
// console.log(App)

import ReactDOM from "./core/ReactDom.js"
// import App from "./App.jsx"
// import App from "./5demojsx/5-2Children.jsx"
// import App from "./5demojsx/5-4optUpdate.jsx"
import App from "./6demouseState/6-1useState.jsx"


import React from "./core/React.js"

ReactDOM.createRoot(document.getElementById('root')).render(<App></App>)

