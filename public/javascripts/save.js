m('.right',
    {style: ctrl.hide()?("right: 5px;height: 10px;"):("right: 5px;")}, [
      m('.chat-title', {onclick: function(){console.log("click");ctrl.hide(!ctrl.hide())}}, "chat title"),
      m('.chat-box', {config: scrollBottom}, [
        ctrl.data.map(function(item){
          return m('div', {key: item.id}, item)
        })
      ])
      ,
      m('input.new-comment[placeholder="New comment ..."]', {
        key: 'input',
        onkeypress: function(e){
          if(e.keyCode == 13){
            ctrl.add()
          } else {
            m.redraw.strategy("none")
          }
        },
        //oninput: m.withAttr('value', ctrl.input)
        value: ctrl.input(),
        oninput: setsVal(ctrl.input)
      })
]) // .right end/**

