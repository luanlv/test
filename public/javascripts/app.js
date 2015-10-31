var redraw = 0;
var rd = function(name){
  //console.log("redraw " + name)
}


var nav = {
  controller: function(){
  },
  view: function(){
    rd("nav");
    return [
      m("a", {href: "/", config: m.route}, "Home"),
    ]
  }
};


var Dashboard = {
  controller: function() {
    console.log("run controller Dashboard");
    var ctrl = this;
    ctrl.data = m.prop(initData.dashboard.data);
  },
  view: function(ctrl) {
      return [
        ctrl.data().map(function (u) {
          return m('div', u.name)
        })
      ]
  }
};





var Loading = {
  controller: function(){

  },
  view: function(){
    console.log("render loading!!");
    return m('', 'LOADING')
  }
};


function route( sub ){
  return {
    controller : function(){
      m.redraw.strategy( 'diff' );
      return new sub.controller();
    },
    view : sub.view
  }
}


m.mount(gId('nav'), nav);
m.mount(gId('app'), Loading);