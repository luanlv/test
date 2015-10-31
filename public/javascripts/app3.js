var Module2 = {

  controller: function(){
    this.doStuff = function() {}
  },
  view: function(ctrl){
    console.log("Render Module2");
    return m("input[type=type]", {
      onkeypress: function(e){
        if(e.keyCode == 13){
          console.log(e.keyCode)
        } else {
          m.redraw.strategy("none")
        }
      }
    }, "redraw")
  }
};


m.mount(gId('app'), Module2);