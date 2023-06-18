$(document).ready(($) => {
  /**
     * formdata to JSON
     */

  (function ($) {
    $.fn.serializeFormJSON = function (obj, str = true) {
      let o = {};
      const a = this.serializeArray();
      $.each(a, function () {
        if (o[this.name]) {
          if (!o[this.name].push) {
            o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
        } else {
          o[this.name] = this.value || '';
        }
      });
      if (obj) {
        o = { ...o, ...obj };
      }
      const x = (str ? JSON.stringify(o) : o);
      return o ? x : null;
    };
  }(jQuery));

  (function ($) {
    $.fn.serializeFormJSON = function (obj, str = true) {
      let o = {};
      const a = this.serializeArray();
      $.each(a, function () {
        if (o[this.name]) {
          if (!o[this.name].push) {
            o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
        } else {
          o[this.name] = this.value || '';
        }
      });
      if (obj) {
        o = { ...o, ...obj };
      }
      const x = (str ? JSON.stringify(o) : o);
      return o ? x : null;
    };
  }(jQuery));
});
