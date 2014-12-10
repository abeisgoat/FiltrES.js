FiltrES ([Filtrex](https://github.com/joewalnes/filtrex) for ElasticSearch)
=======
*Pronounced like Fortress*

A simple, safe, ElasticSearch query engine, allowing you or your end-users to enter arbitrary expressions without p0wning you or learning the ElasticSearch Query language.

````python
(height <= 73 or (favorites.color == "green" and height != 73)) and firstname ~= "o.+"
````

Why?
----

There are many cases where you want a user to be able enter an arbitrary expression through a user interface or simply want to avoid ElasticSearch's powerful, but complicated query language.

Sure, you could do that with ElasticSearch's "script" filter, but I'm sure I don't have to tell you how stupid that would be. It opens up many potential security issues.

FiltrES defines a really simple expression language that should be familiar to anyone who's ever used a spreadsheet and compile it into an ElasticSearch query at runtime.

Features
--------

*   **Simple!** End user expression language looks like this `transactions <= 5 and profit > 20.5`
*   **Fast!** Expressions get compiled into native ElasticSearch queries, offering the same performance as if it had been hand coded. e.g. `{"filtered" : {"filter" : {"bool" : {"must" : {"term" : { "tag" : "wow" }}, "must_not" : {"range" : {"age" : { "from" : 10, "to" : 20 }}}`
*   **Safe!** Expressions cannot escape the sandbox client-side or inside of ElasticSearch.
*   **Predictable!** Because users can't define loops or recursive functions, you know you won't be left hanging.

Get it
------

*    **DOWNLOAD [filtres.js](https://rawgit.com/abeisgreat/filtres/master/filtres.js) or [filtres.min.js](https://rawgit.com/abeisgreat/filtres/master/filtres.min.js)**

10 second tutorial (using [ElasticSearchClient](https://github.com/phillro/node-elasticsearch-client))
------------------

````javascript
// A search filter
var expression = 'transactions <= 5 and profit > 20.5';

// Compile expression to executable function
var myQuery = filtres.compile(expression);

// Execute query
esc.search("filtres", "accounts", myQuery, function (err, accounts) {
    ...
});
````

Expressions
-----------

There are only 2 types: numbers and strings. Numbers may be floating point or integers. Boolean logic is applied on the truthy value of values (e.g. any non-zero number is true, any non-empty string is true, otherwise false).

Values | Description
--- | ---
43, -1.234 | Numbers
"hello" | String
foo, a.b.c | External data variable defined by application (may be numbers or strings)

Comparisons | Description
--- | ---
x == y | Equals
x != y | Not equals
x ~= "y" | Matched to y evaluated as a RegExp
x ~!= "y" | Not matched to y evaluated as a RegExp
x < y | Less than
x <= y | Less than or equal to
x > y | Greater than
x >= y | Greater than or equal to

Boolean logic | Description
--- | ---
x or y | Boolean or
x and y | Boolean and
not x | Boolean not
( x ) | Explicity operator precedence

Operator precedence follows that of any sane language.

FAQ
---

**Why the name?**

Because it was originally built for FILTeR EXpressions then ported to ElasticSearch (i.e. ES).

**What's Jison?**

[Jison](http://zaach.github.io/jison/) is bundled with FiltrES - it's a JavaScript parser generator that does the underlying hard work of understanding the expression. It's based on Flex and Bison.

**License?**

[MIT](https://github.com/abeisgreat/filtres/raw/master/LICENSE)

**Unit tests?**

[Here!](https://github.com/abeisgreat/filtres/blob/master/test/filtres-test.js)

**What happens if the expression is malformed?**

Calling `filters.compile()` with a malformed expression will throw an exception. You can catch that and display feedback to the user. A good UI pattern is to attempt to compile on each keystroke and continuously indicate whether the expression is valid.

And **[follow @abeisgreat](https://twitter.com/abeisgreat)** ([FiltrES](https://github.com/abeisgreat/filtrES)) and **[follow @joewalnes](https://twitter.com/joewalnes)** ([Filtrex](https://github.com/joewalnes/filtrex))!

