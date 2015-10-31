// See this Mithril issue #691 and issue #701
var component = {};

var explanationText = "How the test works: This test has buttons that reset the textarea's scrollTop. Trying scrolling the textarea and then clicking on the various reset buttons. If you scroll and then click the button with the value Mithril thinks the scroller has (which starts at 0), in Mithril 0.2.0, changing the scrollTop does not work as expected related to attribute value caching.";

var lotsOfText = explanationText + explanationText + explanationText + explanationText + explanationText + explanationText + explanationText + explanationText + explanationText;

component.controller = function () {
  this.scrollTop = 0;
};

component.view = function (controller) {
  return m("div", [
    "Mithril scrollTop tracking issue",
    m("br"),
    m("textarea", {value: lotsOfText, scrollTop: controller.scrollTop }),
    m("br"),
    m("button", {onclick: function() {lotsOfText = ""; m.redraw(); } }, "Redraw"),
    m("button", {onclick: function() { controller.scrollTop = 0; } }, "Set scrollTop to 0"),
    m("button", {onclick: function() { controller.scrollTop = 50; } }, "Set scrollTop to 50"),
    m("button", {onclick: function() { controller.scrollTop = 100; } }, "Set scrollTop to 100"),
    m("br"),
    explanationText
  ]);
};

m.module(document.body, component);