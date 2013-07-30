(function ($) {

	"use strict" ;

	var DataTable = function (table, opts) {

		this.options = opts ;
		this.table = table ;
		this.currentPage = 0 ; 
		this.currentStart = 0 ; // different from currentPage * pageSize because there is a filter
		this.filterIndex = [] ;
		
		this.table.addClass('datatable') ;
		
		/* If nb columns not specified, count the nunber of column from thead. */
		if (this.options.nbColumns < 0) {
			this.options.nbColumns = this.table.find('thead tr').first().find('th').length ;
		}
		
		/* Create the base for pagination. */
		$(this.options.pagingDivSelector)
			.addClass("pagination pagination-centered pagination-data-tables")
			.html('<ul></ul>') ;
		
		/* DATA ! */
		
		var dataTable = this ;
		
		if (jQuery.isArray(this.options.data)) {
			this.data = this.options.data ;
		}
		else if (jQuery.isPlainObject(this.options.data)) {
			var size ; 
			if (this.table.data('size')) {
				size = parseInt(this.table.data('size'), 10) ;	
			}
			else {
				size = this.options.data.size ;
			}
			this.data = [] ;
			$(this.options.loadingDivSelector).html('<div class="progress progress-striped active datatable-load-bar"><div class="bar" style="width: 0%;"></div></div>') ;
			for (var i=0 ; i < size; i += this.options.pageSize * this.options.pagingNumberOfPages ) {
				this.getAjaxData (i) ;
			}
		}
		else {
			this.data = [] ;
			this.table.find('tbody tr').each(function () {
				var line = [] ;
				$(this).find('td').each(function () { line.push($(this).text()) ; }) ;
				dataTable.data.push(line) ;
			}) ;
		}
		
		/* Add sorting class to all th and add callback. */
		this.createSort () ;
		
		/* Add filter where it's needed. */
		this.createFilter () ;
		
		/* If a sort key is specified, sort. */
        this.triggerSort () ;
		
		/* Then filter (and refresh) ! */
		this.filter () ;
		
	} ;
	
	DataTable.prototype = {
	
		constructor: DataTable,
	
		updateLoadingDivs: function () {
			if (this.data.length === size) {
				$(this.options.loadingDivSelector).remove() ;
			}
			else {
				$(this.options.loadingDivSelector).find('div.progress .bar').css('width', parseInt(100 * this.data.length / size, 10) + '%') ;
			}
		},
				
		getAjaxData: function (start) {
			$.ajax({
				url: this.options.data.url,
				type: this.options.data.type,
				data: {
					offset: start,
					limit: this.options.pageSize * this.options.pagingNumberOfPages 
				},
				ajaxI: start,
				ajaxThis: this,
				success: function (data, text, jqxhr) {
					this.ajaxThis.data = this.ajaxThis.data.concat($.parseJSON(data)) ;
					this.ajaxThis.sort() ;
					this.ajaxThis.filter () ;
					this.ajaxThis.updateLoadingDivs () ;
				},
				error: function (jqhxr, text, error) {
					this.ajaxThis.getAjaxData(this.ajaxI) ;
				}
			}) ;
		},
		
		getHead: function () {
			return this.table.find('thead').first() ;
		},
			
		getBody: function () {
			return this.table.find('tbody').first() ;
		},
		
		getCounter: function () {
			return $(this.options.counterDivSelector) ;
		},
		
		getPagingLists: function () {
			return $(this.options.pagingDivSelector).find('ul') ;
		},
			
		/** Update the paging div. **/
		updatePaging: function () {
		
			/* Be carefull if you change something here, all this part calculate the first and last page to display.
			I choose to center the current page, it's more beautiful... */
		
			var nbPages = this.options.pagingNumberOfPages;
			var dataTable = this ;
			var cp = parseInt(this.currentStart / this.options.pageSize, 10) + 1;
			var lp = parseInt(Math.ceil(this.filterIndex.length / this.options.pageSize), 10);
			var start ;
			var end ;

			if (cp < nbPages/2) { 
				start = 1 ; 
			}
			else if (cp >= lp - nbPages/2) {
				start = lp - nbPages + 1 ;
				if (start < 1) {
					start = 1 ;
				}
			}
			else {
				start = parseInt(cp - nbPages/2 + 1, 10) ;
			}
			
			if (start + nbPages < lp + 1) {
				end = start + nbPages - 1;
			}
			else {
				end = lp ;
			}
			
			/* Juste iterate over each paging list and append li to ul. */
		
			this.getPagingLists().each (function () {
				$(this).html('') ;
                if (dataTable.options.firstPage) {
                    $(this).append('<li class="' + ((cp === 1) ? 'active' : '') + '"><a data-page="first">' + dataTable.options.firstPage + '</a></li>') ;
                }
                if (dataTable.options.prevPage) {
                    $(this).append('<li class="' + ((cp === 1) ? 'active' : '') + '"><a data-page="prev">' + dataTable.options.prevPage + '</a></li>') ;
                }
				for (var i = start ; i <= end ; i++) {
					$(this).append('<li class="' + ((i === cp) ? 'active' : '') + '"><a data-page="' + i + '">' + i + '</a></li>') ;
				}
                if (dataTable.options.nextPage) {
                    $(this).append('<li class="' + ((cp === lp || lp === 0) ? 'active' : '') + '"><a data-page="next">' + dataTable.options.nextPage + '</a></li>') ;
				}
                if (dataTable.options.lastPage) {
                    $(this).append('<li class="' + ((cp === lp || lp === 0) ? 'active' : '') + '"><a data-page="last">' + dataTable.options.lastPage + '</a></li>') ;
				}
			}) ;
			
			/* Add callback. */
			
			this.getPagingLists().find('a').on('click.datatable', function () {
				if ($(this).parent('li').hasClass('active')) {
					return ;
				}
				var page = $(this).data('page') ;
				switch (page) {
				case 'first':
					dataTable.loadPage(1) ;
					break ;
				case 'prev':
					dataTable.loadPage(cp - 1) ;
					break ;
				case 'next':
					dataTable.loadPage(cp + 1) ;
					break ;
				case 'last':
					dataTable.loadPage(lp) ;
					break ;
				default:
					dataTable.loadPage(parseInt(page, 10)) ;
				}
			}) ;
		
		},
			
		updateCounter: function () {
			var cp = this.filterIndex.length ? parseInt(this.currentStart / this.options.pageSize, 10) + 1 : 0 ;
			var lp = parseInt(Math.ceil(this.filterIndex.length / this.options.pageSize), 10);
			var first = this.filterIndex.length ? this.currentStart + 1 : 0 ;
			var last = (this.currentStart + this.options.pageSize) > this.filterIndex.length ? this.filterIndex.length : this.currentStart + this.options.pageSize ;
			this.getCounter().html(this.options.counterText(cp, lp, first, last, this.filterIndex.length)) ;
		},
			
		/** Return a sort function according options.sortKey & options.sortDir **/
		getSortFunction: function () {
			if (jQuery.isFunction(this.options.sort)) {
				return this.options.sort ;
			}
			var key = this.options.sortKey ;
			var asc = this.options.sortDir === 'asc';
			return function (a,b) {
				var vala = a[key], valb = b[key] ;
				if (vala > valb) { return asc ?  1 : -1 ; }
				if (vala < valb) { return asc ? -1 :  1 ; }
				return 0 ;
			} ;
		},
        
        destroyFilter: function () {
  			$('.datatable-filter-line').remove() ;
        },
        
        changePlaceHolder: function () {
            var placeholder = this.options.filterText ? this.options.filterText : '' ;
            $('.datatable-filter-line input[type="text"]').attr('placeholder', placeholder) ;
        },
        
        createTextFilter: function (field) {
            var placeholder = this.options.filterText ? ('placeholder="' + this.options.filterText + '"') : '' ; 
            var input = $('<input type="text" class="datatable-filter datatable-input-text" data-filter="' + field + '" ' + placeholder + '/>') ;
            var dataTable = this ;
            this.filterVals[field] = '' ;
            var typewatch = (function(){
                var timer = 0;
                return function(callback, ms){
                    clearTimeout (timer);
                    timer = setTimeout(callback, ms);
                };
            })();
            input.on('change keyup keydown', (function (datatable) {
                return function () {
                    var val = $(this).val().toUpperCase() ;
                    var field = $(this).data('filter') ;
                    typewatch (function () {
                        datatable.filterVals[field] = val ;
                        datatable.filter () ; 
                    }, 300) ;
                };
            }) (this)) ;
            this.addFilter(field, function (data, val) {
                return data.toUpperCase().indexOf(val) !== -1;
            }) ;
            return input ;
        },
        
        createSelectFilter: function (field) {
            var values = {}, selected = [], multiple = false, empty = true, emptyValue = "" ;
            if (this.options.filters[field] === 'select') {
                values = this.getFilterOptions (field) ;
            }
            else {
                multiple = ('multiple' in this.options.filters[field]) && (this.options.filters[field]['multiple'] === true) ;
                empty = ('empty' in this.options.filters[field]) && this.options.filters[field]['empty'] ;
                emptyValue = (('empty' in this.options.filters[field]) 
                    && (typeof this.options.filters[field]['empty'] === 'string')) ? this.options.filters[field]['empty'] : '' ;
                if ('values' in this.options.filters[field]) {
                    if (this.options.filters[field]['values'] === 'auto') {
                        values = this.getFilterOptions (field) ;
                    }
                    else {
                        values = this.options.filters[field]['values'] ;
                    }
                    if ('default' in this.options.filters[field]) {
                        selected = this.options.filters[field]['default'] ;
                    }
                    else if (multiple) {
                        selected = Object.keys(values) ;
                    }
                    else {
                        selected = [] ;
                    }
                    if (!$.isArray(selected)) {
                        selected = [selected] ;
                    }
                }
                else {
                    values = this.options.filters[field] ;
                    selected = multiple ? Object.keys(values) : [] ;
                }
            }
            var select = $('<select ' + (multiple ? 'multiple="multiple"' : '') + ' class="datatable-filter datatable-select" data-filter="' + field + '"></select>') ;
            if (empty) {
                select.append('<option value="">' + emptyValue + '</option>') ;
            }
            for (var key in values) {
                select.append('<option value="' + key + '" ' + (selected.indexOf(key) !== -1 ? 'selected' : '') + '>' + values[key] + '</option>') ;
            }
            var val = select.val() ;
            this.filterVals[field] = multiple ? val : ((empty && !val) ? Object.keys(values) : [val]) ;
            select.change (function (allKeys, multiple, empty, datatable) {
                return function () {
                    var val = $(this).val() ;
                    var field = $(this).data('filter') ;
                    datatable.filterVals[field] = multiple ? val : ((empty && !val) ? allKeys : [val]) ;
                    datatable.filter () ;
                } ;
            } (Object.keys(values), multiple, empty, this)) ;
            this.addFilter(field, function (data, val) {
                if (!val) { return false ; }
                return val.indexOf(data) !== -1 ;
            }) ;
            return select ;
        },
        
        createFilter: function () {
            this.filters = [] ;
            this.filterVals = [] ;
            if (this.options.filters) {
                var tr = $('<tr class="datatable-filter-line"></tr>').insertAfter(this.table.find('thead tr').last()) ;
                for (var field in this.options.filters) {
                    var td = $('<td></td>') ;
                    if (this.options.filters[field] !== false) {
                        if (this.options.filters[field] === true) {
                            td.append(this.createTextFilter(field)) ;
                        }
                        else {
                            td.append(this.createSelectFilter(field)) ;
                        }
                    }
                    tr.append(td) ;
                }
            }
        },
			
		/** Return the length of data after filtering. **/
		filter: function () {
			this.currentStart = 0 ;
			this.filterIndex = []  ;
			for (var i = 0 ; i < this.data.length ; i++) { 
				if (this.checkFilter(this.data[i])) { this.filterIndex.push(i) ; }
			}
			this.refresh () ;
		},
			
		checkFilter: function (data) {
			var ok = true ;
			for (var fk in this.filters) {
				if (!this.filters[fk](data[fk], this.filterVals[fk])) {
					ok = false ;
					break ;
				}
			}
			return ok ;
		},
			
		addFilter: function (field, filter) {
			this.filters[field] = filter ;
		},
        
        getFilterOptions: function (field) {
        	var options = {}, values = [];
			for (var key in this.data) {
                if (this.data[key][field] !== '') {
                    values.push(this.data[key][field]) ;
                }
			}
			values.sort() ;
            for (var i in values) {
                options[values[i]] = values[i] ;
            }
            return options ;
        },
		
        destroySort: function () {
            $('thead th').removeClass('sorting sorting-asc sorting-desc')
				.unbind('click.datatable')
                .removeData('sort') ;
        },
        
        createSort: function () {
            var dataTable = this ;
            if (!jQuery.isFunction(this.options.sort)) {
            
                var countTH = 0 ;
                
                this.table.find('thead th').each (function () {
                
                    if ($(this).data('sort')) {
                        dataTable.options.sort = true ;
                    }
                    else if (dataTable.options.sort === '*') {
                        $(this).data('sort', countTH) ;
                    }
                    else if (jQuery.isArray(dataTable.options.sort) && dataTable.options.sort[countTH]) {
                        $(this).data('sort', countTH) ;
                    }
                    
                    if ($(this).data('sort') !== undefined) {
                        $(this).addClass('sorting')  ;
                    }
                    
                    countTH ++ ;
                
                }) ;
                
                this.table.find('thead th').on('click.datatable', function () {
                    if ($(this).data('sort') !== undefined) {
                        if ($(this).hasClass('sorting-asc')) {
                            dataTable.options.sortDir = 'desc' ;
                            $(this).removeClass('sorting-asc')
                                .addClass('sorting-desc') ;
                        }
                        else if ($(this).hasClass('sorting-desc')) {
                            dataTable.options.sortDir = 'asc' ;
                            $(this).removeClass('sorting-desc') 
                                .addClass('sorting-asc') ;
                        }
                        else {
                            $(this).parent('tr').find('th').removeClass('sorting-desc').removeClass('sorting-asc') ;
                            dataTable.options.sortDir = 'asc' ;
                            dataTable.options.sortKey = $(this).data('sort') ;
                            $(this).addClass('sorting-asc') ;
                        }
                        dataTable.sort () ;
                        dataTable.refresh () ;
                    }
                }) ;
            
            }
        },
        
		/** Trigger sort on the table: If options.sort is a function, sort
        the table, otherwize trigger click on the column specifid by options.sortKey. **/
        triggerSort: function () {
            if (jQuery.isFunction(this.options.sort)) {
                this.sort() ;
            }
            else if (this.options.sortKey !== false) {
                var th ;
                this.table.find('th').each(function (sortKey) {
                    return function () {
                        if ($(this).data('sort') === sortKey) {
                            th = $(this) ;
                        } 
                    } ;
                } (this.options.sortKey)) ;
                if (th !== undefined) {
                    th.trigger('click') ;
                }
            }
        },
        
        /** Sort the data (WITHOUT REFRESHING). **/
		sort: function () {
			if (!this.options.sort) {
				return ;
			}
			this.data.sort(this.getSortFunction()) ;
		},
			
		/** Add a 'row' (a data). **/
		addRow: function (data) {
			this.data.push(data) ; 
			this.sort() ;
			this.filter () ;
			this.currentStart = parseInt(this.filterIndex.indexOf(this.data.indexOf(data)) / this.options.pageSize, 10) * this.options.pageSize ;
			this.refresh () ;
		},
		
		/** Get a row from the datas. */
		row: function (rowId) {
			return this.data[rowId];
		},
			
		/** Remove a 'row'. */
		deleteRow: function (rowId) {
			var oldCurrentStart = this.currentStart ;
			this.data.splice(rowId, 1) ;
			this.filterIndex.splice(this.filterIndex.indexOf(rowId), 1) ;
			this.filter () ;
			if (oldCurrentStart < this.filterIndex.length) {
				this.currentStart = oldCurrentStart ;
			}
			else {
				this.currentStart = oldCurrentStart - this.options.pageSize ;
				if (this.currentStart < 0) { this.currentStart = 0 ; }
			}
			this.refresh () ;
		},
			
		/** Update a 'row' (data). **/
		updateRow: function (rowId, data) {
			this.data.splice(rowId, 1);
			this.addRow(data) ;
		},
		
		/** Change the current page and refresh. **/
		loadPage: function (page) {
            var oldPage = this.currentStart / this.options.pageSize ;
			this.currentStart = (page - 1) * this.options.pageSize  ;
			this.refresh () ;
            this.options.onChange (oldPage + 1, page) ;
		},
			
		/** Refresh the page according to current page (DO NOT SORT).
		This function call options.lineFormat. **/
		refresh: function () {
			this.options.beforeRefresh () ;
			this.updatePaging () ;
			this.updateCounter () ;
			this.getBody().html('') ;
			if (this.currentStart >= this.currentDataLength) {
				this.getBody().append('<tr><td colspan="' + this.options.nbColumns + '"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div></tr>') ;
				return ;
			}
			for (var i=0; i<this.options.pageSize && i+this.currentStart < this.filterIndex.length; i++) {
				this.getBody().append(this.options.lineFormat(this.filterIndex[this.currentStart+i], this.data[this.filterIndex[this.currentStart+i]])) ;
			}
			this.options.afterRefresh () ;
		},
		
		/** Set en option and refresh the table. **/
		setOption: function (key, val) {
			if (key in this.options) {
				this.options[key] = val ;
                if (key === 'sort') {
                    this.destroySort () ;
                    this.createSort () ;
                    this.triggerSort () ;
                }
                if (key === 'sortKey' || key === 'sortDir') {
                    this.sort() ;
                }
                if (key === 'filters') {
                    this.destroyFilter () ;
                    this.createFilter () ;
                }
                if (key === 'filterText') {
                    this.changePlaceHolder () ;
                }
				this.filter () ;
			}
		},
        
        setOptions: function (options) {
            for (var key in options) {
                if (key in this.options) {
                    this.options[key] = options[key] ;
                }
            }
            if ('sort' in options) {
                this.destroySort () ;
                this.createSort () ;
                this.triggerSort () ;
            }
            else if ('sortKey' in options || 'sortDir' in options) {
                this.sort() ;
            }
            if ('filters' in options) {
                this.destroyFilter () ;
                this.createFilter () ;
            }
            if ('filterText' in options) {
                this.changePlaceHolder () ;
            }
            this.filter () ;
        },
		
		/** Remove all the elements added by the datatable. **/
		destroy: function () {
			this.destroySort () ;
			$(this.options.pagingDivSelector)
				.removeClass("pagination pagination-centered pagination-data-tables")
				.html('') ;
            this.destroyFilter () ;
			this.table.removeClass('datatable') ;
			this.getBody().html('') ;
			for (var i=0; i<this.data.length; i++) {
				this.getBody().append(this.options.lineFormat(i, this.data[i])) ;
			}

		}
	} ;
 
    $.fn.datatable = function() {
		var args = arguments ;
		var ret = -1, each ;
		if (args.length === 0) { args = [{}] ; }
		each = this.each(function () {
			if ($.isPlainObject(args[0])) {
                if (this.datatable === undefined) {
                    this.datatable = new DataTable($(this), $.extend({}, $.fn.datatable.defaults, args[0])) ;
                }
                else {
                    this.datatable.setOptions(args[0]) ;
                }
			}
			else if (typeof args[0] === 'string') {
				switch (args[0]) {
				case 'select':
					ret = this.datatable.row(args[1]) ;
					break ;
				case 'insert':
					this.datatable.addRow(args[1]) ;
					break ;
				case 'update':
					this.datatable.updateRow(args[1], args[2]) ;
					break ;
				case 'delete':
					this.datatable.deleteRow(args[1]) ;
					break ;
				case 'option':
					if (args[1] in this.datatable.options) {
						this.datatable.setOption(args[1], args[2]) ;
					}
					break ;
				case 'destroy':
					this.datatable.destroy () ;
					delete this.datatable ;
					break ;
				}
			}
		}) ;
		return ret !== -1 ? ret : each ;
    };
	
	$.fn.datatable.defaults = {
		pagingDivSelector: '.paging',
		counterDivSelector: '.counter',
		loadingDivSelector: '.loading',
		sort: false,
		sortKey: false,
		sortDir: 'asc',
		nbColumns: -1,
		pageSize: 20,
		pagingNumberOfPages: 9,
        onChange: function (oldPage, newPage) { },
		counterText: function (currentPage, totalPage, firstRow, lastRow, totalRow) {
			return 'Page ' + currentPage + ' on ' + totalPage + '. Starting at ' + firstRow + ', ending at ' + lastRow + ' over ' + totalRow + ' entries.' ;
		},
        firstPage: '&lt;&lt;',
        prevPage: '&lt;',
        nextPage: '&gt;',
        lastPage: '&gt;&gt;',
		filters: {},
        filterText: 'Search... ',
		beforeRefresh: function () { },
		afterRefresh: function () { },
		lineFormat: function (id, data) { 
			var res = $('<tr></tr>') ;
			for (var key in data) { res.append('<td>' + data[key] + '</td>') ; }
			return res ;
		}
	} ;
 
} (window.jQuery)); 