//helpers
var rd1 = 0;
var rd2 = 0;
var target = [];

function tenant(id, module) {
  target.push(id);
  return {
    controller: module.controller,
    view: function(ctrl) {
      if(target.indexOf(id) != -1 || id == "all"){
        target.splice(target.indexOf(id), 1);
        return module.view(ctrl);
      } else {
        return {subtree: "retain"}
      }
    }
  }
}

function local(ids, callback) {
  return function(e) {
    ids.map(function(id){
      target.push(id)
    });
    callback.call(this, e)
  }
}

//a module
var Module1 = {
  controller: function() {
    this.doStuff = function() {}
  },
  view: function(ctrl) {
    console.log("Render/redraw Module1");
    rd1++;
    return m("button[type=button]", {
      onclick: local(["Module1"], ctrl.doStuff)
    }, "redraw Module1: " + rd1)
  }
};

var Module2 = {
  controller: function(){
    this.doStuff = function() {}
  },
  view: function(ctrl){
    rd2++
    console.log("Render/redraw Module2");
    return m("button[type=button]", {
      onclick: local(["Module2"], ctrl.doStuff)
    }, "redraw Module2 : " + rd2)
  }
};

var Statistic = {
  controller: function(){},
  view: function(ctrl){
    return m('.statistic', [
      m("button[type=button]", {
        onclick: local(["Module1", "Module2"], function(){})
      }, "redraw all !" ),
        m('',  "Statistic:"),
        m('ul', [
            m('li', "Module1: " + rd1),
            m('li', "Module2: " + rd2)
        ])
    ])
  }
}


//init
m.mount(gId('nav'), tenant("Module1", Module1));
m.mount(gId('app'), tenant("Module2", Module2));
m.mount(gId('statistic'), tenant("all", Statistic));