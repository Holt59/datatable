(function ($) {

    "use strict";

    $.fn.datatable = function () {
        var args = arguments;
        var ret = -1, each;
        if (args.length === 0) { args = [{}]; }
        each = this.each(function () {
            if ($.isPlainObject(args[0])) {
                if (this.datatable === undefined) {
                    if ('lineFormat' in args[0]) {
                        args[0].lineFormat = function (f) {
                            return function (i, d) {
                                return f(i, d).get(0);
                            }
                        } (args[0].lineFormat);
                    }
                    if ('pagingPages' in args[0]) {
                        args[0].pagingPages = function (f) {
                            return function (sp, ep, cp, st, en) {
                                return f(sp, ep, cp, st, en).toArray();
                            }
                        } (args[0].pagingPages);
                    }
                    this.datatable = new DataTable(this, args[0]);
                    /* If a sort key is specified, sort. */
                    this.datatable.triggerSort();
                    /* Then filter (and refresh) ! */
                    this.datatable.filter();
                }
                else {
                    this.datatable.setOptions(args[0]);
                }
            }
            else if (typeof args[0] === 'string') {
                switch (args[0]) {
                    case 'page':
                        if (1 in args) {
                            this.datatable.loadPage(parseInt(args[1]));
                        }
                        else {
                            ret = this.datatable.getCurrentPage();
                        }
                        break;
                    case 'reset-filters':
                        this.datatable.resetFilters();
                        break;
                    case 'select':
                        if (1 in args && !$.isFunction(args[1])) {
                            ret = this.datatable.row(args[1]);
                        }
                        else {
                            ret = this.datatable.all(args[1]);
                        }
                        break;
                    case 'insert':
                        if ($.isArray(args[1])) {
                            this.datatable.addRows(args[1]);
                        }
                        else {
                            this.datatable.addRow(args[1]);
                        }
                        break;
                    case 'update':
                        this.datatable.updateRow(args[1], args[2]);
                        break;
                    case 'delete':
                        if ($.isFunction(args[1])) {
                            this.datatable.deleteAll(args[1]);
                        }
                        else {
                            this.datatable.deleteRow(args[1]);
                        }
                        break;
                    case 'option':
                        this.datatable.setOption(args[1], args[2]);
                        break;
                    case 'refresh':
                        this.datatable.refresh();
                        break;
                    case 'destroy':
                        this.datatable.destroy();
                        delete this.datatable;
                        break;
                }
            }
        });
        return ret !== -1 ? ret : each;
    };

} (window.jQuery));