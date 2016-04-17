---
layout: post
title:  "[MongoDB] Get a random document with benchmarks"
date:   2015-01-18
---
> Disclaimer:<br />
> I'm new to MongoDB thus there might be a better/cleaner way to do things, if you can improve the following let me know!

There isn't a command to get one record in a collection randomly in MongoDB so we need to get creative.
I could find three way to deal with this problem, the first solution requires you to add something to your documents. This wasn't great for me so I came up with another solution. Finally the last one use `skip()`.

# The random attribute: Method 1 & 2

This method is quite simple:

1. Add and attribute with a random value to every document in the collection, let's call it `random_point`
2. Generate a random value and query the collection to find a document with the closest `random_point` attribute

The obvious advantages is the fact that it's easy. The downside is that you need to add something to **every** document in the collection, depending on the size of your collection this can be long. Memory might be a concern too.

I found two sub-methods to achieve this:

* [Method 1: using MongoDB 2D vodoo](https://disqus.com/home/discussion/MongoDB/the_random_attribute_the_MongoDB_cookbook/#comment-452243980)
* [Method 2: the regular method](http://bdadam.com/blog/finding-a-random-document-in-MongoDB.html)

Both of those methods require some pre-processing, see benchmark for pre-processing scripts.

# The ObjectID manipulation: Method 3

The whole point of this method is to get a random document without adding anything to the collection. The method works by considering ObjectID values as a finite linear range of integer values coded in hexadecimal. It sounds a bit complicated but it's actually what you would do to get a random integer:

<pre>
var random_int = Math.floor( Math.random() * (MAX + 1) );
</pre>

This solution come with *very* strong constraints:

* Your set of ObjectID `_id` values **have to be linear**, no gaps (see note below the code snippet)
* You need to save the first ObjectID (e.g. the smallest `_id` value for all documents)
* You need to save the number of documents

Thus this solution isn't great if you have a constantly changing collection (e.g. deletions are a problem, you also have to refresh the count upon insertion). The constraint on `_id` is not that big of a problem in reality because you can set the ObjectID to a choosen value.

Also there is a (theoretical) limit on the sheer number of documents in your collection due to integer max values in JavaScript. Indeed we need to parse the ObjectID value string (24 hexadecimal characters) and transform it in a integer to perform some computations. Now JavaScript isn't the best for large integer numbers so the whole ObjectID value can't fit in a integer, thus we keep the last characters `[11 -> 24[` to build the integer.


<pre>
/*
 * This method requires you to initialize a query.
 */
function random_id(obj_id_slice1, obj_id_slice2, count) {
	var v = obj_id_slice2 + Math.floor(Math.random() * (count + 1));
	return ObjectId(obj_id_slice1 + v.toString(16));
}

var count = db.col.count();
var first_obj_id = db.col.find().sort({ _id: 1 }).limit(1)[0]._id.valueOf();

var first_obj_id_slice1 = first_obj_id.slice(0, 11);
var first_obj_id_slice2 = parseInt(first_obj_id.slice(11, 24), 16);

/*
 * The query.
 */
db.col.findOne({ _id: { $gte: random_id(first_obj_id_slice1, first_obj_id_slice2, count) } });
</pre>

> Note: We could deal with non continuous sets of `_id`:
> by looping on `random_id()` and test if `_id` exist in the collection.
> This can be interesting if you have very few gaps in the `_id` values ensemble but the hit/miss rate can skyrocket if you have lots of gaps!

Because I wondered how this solution would hold-up against other methods I ran a minimalistic benchmark. The original benchmark idea is from [here](http://bdadam.com/blog/finding-a-random-document-in-MongoDB.html)

# The skip trick: Method 4a & 4b

This method is very basic, you query every documents in the collection and skip a random number of indexed documents. Thus, method 4a:

<pre>
db.col.find().limit(-1).skip(Math.random() * db.col.count());
</pre>

Apparently `skip()` isn't incredibly efficient on large collections and is judged to be "naughty": [disqus.com/home/discussion/MongoDB/the_random_attribute_the_MongoDB_cookbook/#comment-67490101](https://disqus.com/home/discussion/MongoDB/the_random_attribute_the_MongoDB_cookbook/#comment-67490101).

Method 4b is a small improvement of 4a, instead of executing `db.col.count()` each time, you simply save the document count in a variable.

Obviously method 4a is fine if your document count is constantly changing. For both of those methods you don't need to add anything to your documents this is a clear advantage.

# Benchmarks

This benchmark ran on a 2nd generation Intel i3 processor (laptop version) with 4Go of ram and a SSD. For the software part I used MongoDB 2.6.6 on Archlinux. I didn't recorded the pre-processing phase for method 1 and 2 because the code didn't *felt* optimal.

The dataset was generated using [ipsum](https://github.com/buzzm/ipsum) with the following model:

<pre>
{
  "$schema": "http:\/\/json-schema.org\/draft-04\/schema",

  "type": "object",
  "properties": {
    "productName": { "type": "string" },
    "productDesc": { "type": "string", "ipsum": "sentence" },
    "productID":   { "type": "string", "ipsum": "id" }
  }
}
</pre>

Two sets of data were used to see if and how collection size affect the query time. For runs 1 to 4 I used 100,000 documents and for runs 5 and 6 it was a 1,000,000 documents collection. I don't publish the data files because they are quite large, plus your generated data should be as good as mine.

Each benchmark consists of:

1. Reset the database: `mongoimport -d benchmark -c col --drop < data.json`
2. Run the pre-processing script (Method 1 and 2 only): `mongo < methodX_prepare.js`
3. Run the test multiple times: `mongo < methodX_run.js`, each run script executes 10,000 queries

You can find the whole set of gists I used [here](https://gist.github.com/alan-mushi/f41362ada94883c88817).

## Results
Here are the results (in seconds):

|           | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Run 6 |
|:---------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
| Method 1  | 4.275 | 3.828 | 4.165 | 4.139 | 5.749 | 5.844 |
| Method 2  | 1.818 | 1.506 | 1.776 | 1.541 | 1.520 | 1.624 |
| Method 3  | 1.729 | 1.907 | 1.589 | 2.058 | 2.262 | 2.401 |
| Method 4a | 2.198 | 2.256 | 2.464 | 2.291 | 2.809 | 2.291 |
| Method 4b | 0.188 | 0.193 | 0.175 | 0.195 | 0.308 | 0.167 |


<div id="bench-graph"></div>
<div id="legend"></div>

<link href='{{ site.url }}/assets/metricsgraphics.css' rel='stylesheet' type='text/css'>

<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.0/d3.min.js' charset='utf-8'></script>
<script src='{{ site.url }}/assets/metricsgraphics.js'></script>

<script>
$(document).ready(function() {
    var data = [
        [
            { "run": 1, "time": 4.275 },
            { "run": 2, "time": 3.828 },
            { "run": 3, "time": 4.165 },
            { "run": 4, "time": 4.139 },
            { "run": 5, "time": 5.749 },
            { "run": 6, "time": 5.844 }
        ],
        [
            { "run": 1, "time": 1.818 },
            { "run": 2, "time": 1.506 },
            { "run": 3, "time": 1.776 },
            { "run": 4, "time": 1.541 },
            { "run": 5, "time": 1.520 },
            { "run": 6, "time": 1.624 }
        ],
        [
            { "run": 1, "time": 1.729 },
            { "run": 2, "time": 1.907 },
            { "run": 3, "time": 1.589 },
            { "run": 4, "time": 2.058 },
            { "run": 5, "time": 2.262 },
            { "run": 6, "time": 2.401 }
        ],
        [
            { "run": 1, "time": 2.198 },
            { "run": 2, "time": 2.256 },
            { "run": 3, "time": 2.464 },
            { "run": 4, "time": 2.291 },
            { "run": 5, "time": 2.809 },
            { "run": 6, "time": 2.291 }
        ],
        [
            { "run": 1, "time": 0.188 },
            { "run": 2, "time": 0.193 },
            { "run": 3, "time": 0.175 },
            { "run": 4, "time": 0.195 },
            { "run": 5, "time": 0.308 },
            { "run": 6, "time": 0.167 }
        ]
    ];

    MG.data_graphic({
        title:"Benchmarks results",
        description: "Results are in seconds per 10,000 random picks",
        legend: ['Method 1', 'Method 2', 'Method 3', 'Method 4a', 'Method 4b'],
        legend_target: '#legend',
        data: data,
        target: '#bench-graph',
        y_extended_ticks: true,
        x_accessor: 'run',
        x_label: 'run',
        y_accessor: 'time',
        y_label: 'time (seconds)',
        markers: [{ 'run': 4.5, 'label': "1,000,000 documents" }],
        width: 740
    });
});
</script>

Conclusions:

* Method 1 is a great trick, but is slower than method 2 and it scale very poorly
* Method 2 is OK
* Method 3 hold up surprisingly well (I truly didn't expect it)
* Method 4a is a bit slower than method 2
* Method 4b is the fastest, by far!
