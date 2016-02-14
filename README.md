Datatable v2.0.0
================

Datatable is a javascript plugin for dynamic datatables with pagination, filtering and ajax loading. This plugin **does not require jQuery** any longer since version 2.0.0.

How to use?
===========

Datatable is quite simple to use. Just add the CSS and Javascript files to your page:

```html
<script type="text/javascript" src="js/datatable.min.js"></script>
```

And run:

```javascript
var datatable = new DataTable(document.getElementById('MyTable'), {
    pageSize: 15,
    sort: '*'
});

datatable.loadPage(3);
var data = datatable.all();
datatable.deleteAll(function (e) {
    return e.title.trim().length > 0;
});
```

If you use jQuery:

```html
<script type="text/javascript" src="js/jquery.min.js"></script> 
<script type="text/javascript" src="js/datatable.min.js"></script>
<script type="text/javascript" src="js/datatable.jquery.min.js"></script>
```

And run:

```javascript
$('#MyTable').datatable({
    pageSize: 15,
    sort: '*'
}) ;

$('#MyTable').datatable('page', 3);
var data = $('#MyTable').datatable('select');
$('#MyTable').datatable('delete', function (e) {
    return e.title.trim().length > 0;
});

```

**Note:** If you are using bootstrap, use `datatable-boostrap.css` instead of `datatable.css`.

The full plugin documentation is available here: http://holt59.github.io/datatable

**Warning:** If you use bootstrap 2, you need to manually set the <code>pagingListClass</code> and <code>pagingDivClass</code> options to match bootstrap 2 pagination classes.

Copyright and license
=====================

Copyright 2016 Mikaël Capelle.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
