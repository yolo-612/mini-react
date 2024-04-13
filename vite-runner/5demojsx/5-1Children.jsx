import React from "../core/React.js"

let showBar = false
function Counter() {
  const foo = <div>foo</div>
  function Bar(){
    return <div>Bar</div>
  }
  // const bar = <p>bar</p>
  function handleShowBar() {
    showBar = !showBar
    React.update()
  }
  return (
    <div>
      counter
      {/* <div>{showBar ? bar : foo}</div> */}
      <div>{showBar ? <Bar></Bar> : foo}</div>
      <button onClick={handleShowBar}>showBar</button>
    </div>
  )
}

function App() {
  return (
    <div>
      mini-react
      <Counter></Counter>
    </div>
  )
}

export default App
