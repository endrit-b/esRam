define(["exports", "module", "dojo/_base/declare", "dojo/on", "dojo/dom-class", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/dom-construct", "esri/graphicsUtils", "dojo/text!./templates/AutoComplete.html", "ramda"], function (exports, module, _dojo_baseDeclare, _dojoOn, _dojoDomClass, _dijit_WidgetBase, _dijit_TemplatedMixin, _dojoDomConstruct, _esriGraphicsUtils, _dojoTextTemplatesAutoCompleteHtml, _ramda) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var declare = _interopRequire(_dojo_baseDeclare);

  var on = _interopRequire(_dojoOn);

  var add = _dojoDomClass.add;
  var remove = _dojoDomClass.remove;

  var _WidgetBase = _interopRequire(_dijit_WidgetBase);

  var _TemplatedMixin = _interopRequire(_dijit_TemplatedMixin);

  var create = _dojoDomConstruct.create;
  var graphicsExtent = _esriGraphicsUtils.graphicsExtent;

  var templateString = _interopRequire(_dojoTextTemplatesAutoCompleteHtml);

  var compose = _ramda.compose;
  var curry = _ramda.curry;
  var prop = _ramda.prop;
  var filter = _ramda.filter;
  var map = _ramda.map;
  var eq = _ramda.eq;
  var take = _ramda.take;
  var last = _ramda.last;
  var sortBy = _ramda.sortBy;

  var isValid = function (a, b) {
    return a.indexOf(b) > -1;
  };
  var getName = prop("NAME");
  var getProps = prop("attributes");
  var getPropName = compose(getName, getProps);
  var upper = function (s) {
    return s.toUpperCase();
  };
  var filtername = function (name) {
    return filter(function (x) {
      return eq(upper(getPropName(x)), upper(name));
    });
  };
  var fuzzyname = function (name) {
    return filter(function (x) {
      return isValid(upper(getName(x)), upper(name));
    });
  };
  var getfuzzyname = function (name) {
    return compose(fuzzyname(name), map(getProps));
  };

  var makeListItem = function (x) {
    var a = create("a", {
      className: "list-group-item",
      href: "",
      innerHTML: getName(x),
      "data-result-name": getName(x)
    });
    return a;
  };

  module.exports = declare([_WidgetBase, _TemplatedMixin], {
    templateString: templateString,

    postCreate: function postCreate() {
      var layer = this.get("layer");
      on.once(layer, "update-end", this.onLoaded.bind(this));
    },

    onLoaded: function onLoaded(e) {
      this.set("features", e.target.graphics);
    },

    onKeyDown: function onKeyDown(e) {
      console.debug("keycode", e);
      switch (e.keyCode) {
        case 38:
          //up
          this.select(1);
          console.debug("key up", e);
          break;
        case 40:
          //down
          this.select(-1);
          console.debug("key down", e);
          break;
        default:
          console.debug("key default");
      }
    },

    onKeyUp: function onKeyUp(e) {
      var _this = this;

      if (e.keyCode === 38 || e.keyCode === 40) {
        this.onKeyDown(e);
      } else {
        this.results.innerHTML = "";
        if (this.input.value.length > 2) {
          var results = getfuzzyname(this.input.value)(this.get("features"));
          this.resultElems = compose(map(function (x) {
            _this.results.appendChild(x);
            _this.own(on(x, "click", _this.itemSelected.bind(_this)));
            return x;
          }), map(makeListItem), take(10))(results);
          this._count = -1;
        }
      }
    },

    select: function select(i) {
      this._count = this._count - i;
      if (this._count < 0) this._count = this.resultElems.length - 1;
      if (this._count > this.resultElems.length - 1) this._count = 0;
      if (this._selection) {
        remove(this._selection, "active");
        this._selection = this.resultElems[this._count];
      }
      if (!this._selection) {
        this._selection = this.resultElems[this._count];
        add(this._selection, "active");
      }
      if (this._selection) {
        add(this._selection, "active");
      }
    },

    resultSelected: function resultSelected() {
      var elem = this._selection;
      var value = elem.innerHTML;
      this.results.innerHTML = "";
      this.input.value = elem.getAttribute("data-result-name");
      this._selection = null;
      this.find();
    },

    itemSelected: function itemSelected(e) {
      if (e) e.preventDefault();
      var elem = e.target;
      var value = elem.innerHTML;
      this.input.value = elem.getAttribute("data-result-name");
      var result = filtername(this.input.value)(this.get("features"));
      var data = result.shift();
      if (data) {
        this.get("map").setExtent(graphicsExtent([data]));
      }
      this.results.innerHTML = "";
    },

    find: function find(e) {
      if (e) e.preventDefault();
      if (this._selection) {
        this.resultSelected(e);
      } else {
        var data = last(filtername(this.input.value)(this.get("features")));
        if (data) {
          this.get("map").setExtent(graphicsExtent([data]));
        }
      }
    } });
});