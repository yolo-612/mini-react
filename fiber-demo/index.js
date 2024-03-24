// 任务调度器

let raskId = 1
function workLoop(deadline){
  raskId++

  let shouldYield = false;

  while(!shouldYield){
    console.log(deadline.timeRemaining(), 'raskid===>second', raskId )
    shouldYield = deadline.timeRemaining() < 1

  }
  
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)