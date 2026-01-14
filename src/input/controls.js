(function(){
  window.inputState = {left:false,right:false,up:false,down:false};
  window.addEventListener('keydown', (e) => {
    switch(e.key){
      case 'ArrowLeft': case 'a': window.inputState.left = true; break;
      case 'ArrowRight': case 'd': window.inputState.right = true; break;
      case 'ArrowUp': case 'w': window.inputState.up = true; break;
      case 'ArrowDown': case 's': window.inputState.down = true; break;
    }
  });
  window.addEventListener('keyup', (e) => {
    switch(e.key){
      case 'ArrowLeft': case 'a': window.inputState.left = false; break;
      case 'ArrowRight': case 'd': window.inputState.right = false; break;
      case 'ArrowUp': case 'w': window.inputState.up = false; break;
      case 'ArrowDown': case 's': window.inputState.down = false; break;
    }
  });
})();
