$.widget('ui.iconbutton', $.extend({}, $.ui.button.prototype, {
  _init: function () {
    $.ui.button.prototype._init.call(this);
    this.element.removeClass('ui-corner-all')
                    .addClass('ui-iconbutton')
                    .unbind('.button');
  }
}));
