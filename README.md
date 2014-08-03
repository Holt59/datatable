Datatable v1.0.5
================

Datatable is a jQuery plugin for dynamic datatables with pagination, filtering and ajax loading.

How to use?
===========

Datatable is quite simple to use. Just add the CSS and Js file to your page (do not forget jquery):

```
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script> 
<script type="text/javascript" src="js/datatable.js"></script>
```

And run:

```
$('#MyTable').datatable() ;
```

**Note:** If you use bootstrap CSS, you use `datatable-boostrap.css` instead of `datatable.css`.

The full plugin documentation is available here: http://holt59.github.io/datatable

**Warning:** If you use bootstrap 3, you need to manually set the <code>pagingListClass</code> and <code>pagingDivClass</code> options to match bootstrap 3 pagination classes.

Copyright and license
=====================

Copyright 2013 Mikaël Capelle.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
