Datatable v1.0.6
================

Datatable is a jQuery plugin for dynamic datatables with pagination, filtering and ajax loading.

<i>**Warning:** This is an old version of the plugin using jQuery, if you are looking for a standalone version (much faster!), check out the <a href="https://github.com/Holt59/datatable/tree/master">master</a> branch.</i>

How to use?
===========

Datatable is quite simple to use. Just add the CSS and Js file to your page (do not forget jquery):

```html
<script type="text/javascript" src="js/jquery.min.js"></script> 
<script type="text/javascript" src="js/datatable.min.js"></script>
```

And run:

```javascript
$('#MyTable').datatable() ;
```

**Note:** If you are using bootstrap, use `datatable-boostrap.css` instead of `datatable.css`.

The full plugin documentation is available here: http://holt59.github.io/datatable

**Warning:** If you use bootstrap 3, you need to manually set the <code>pagingListClass</code> and <code>pagingDivClass</code> options to match bootstrap 3 pagination classes.

Copyright and license
=====================

Copyright 2013 Mikaël Capelle.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
