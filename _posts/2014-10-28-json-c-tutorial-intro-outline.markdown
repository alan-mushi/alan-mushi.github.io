---
layout: post
title:  "[json-c] Tutorial introduction & outline"
date:   2014-10-28
tags:   tutorial json-c
---
A tutorial on json manipulation in C on GNU/Linux (various BSD flavors should work too).

# First things first

This tutorial will assume you have a basic knowledge of the json format and of the C programming langage. If you don't know what json is, you should read [json.org](http://www.json.org).

Examples have been tested on Archlinux with json-c (0.12-2) and clang (3.5.0).

## Why json-c ?

Other libraries handle the json format in C but json-c have the advantage to be ligth and don't drag a whole set of gigantic dependencies (e.g. Glib). This is probably important if your program is oriented for embedded.

json-c is open source so check it out: [github.com/json-c/json-c](https://github.com/json-c/json-c)

## Installation

I won't cover this part in depth, you should be able to install a package on your system.
Bear in mind that the naming of this packet *isn't* consistant from a distribution to another. Here is a little list of all variants I've encountered:

* json-c
* libjson
* libjson0

For the rest of the tutorial you will obviously need the developpent version of those packages.

## Compilation

Add the json-c header to your program:
{% highlight c %}
#include <json.h>
{% endhighlight %}

Here is an example on how to compile using the json-c library:
{% highlight text %}
$ clang -I/usr/include/json-c/ -o test test.c -ljson-c
{% endhighlight %}

I prefer clang but gcc works just as well. Be sure to **check the include path**, depending on the packet name it may be different!

## Documentation

The documentation is available online: [json-c.github.io/json-c/](https://json-c.github.io/json-c/). Files `json_object.c` and/or `json_tokener.c` is most likely what you are looking for.

# Outline

I did not reinvented the weel (shame on me), a good tutorial on json-c already exist: [linuxprograms.wordpress.com/2010/05/20/json-c-libjson-tutorial/](http://linuxprograms.wordpress.com/2010/05/20/json-c-libjson-tutorial/). However, the tutorial linked above have some issues mainly due to outdated versions, partial example files, memory leaks and symbol filtering preventing most copy/paste. This is *too* painful, I had to (try to) make a better tutorial!

Thus, the outline:

1. [Print everything]({{ site.url }}/2014/10/28/json-c-tutorial-part-1.html)
2. [Types]({{ site.url }}/2014/10/28/json-c-tutorial-part-2.html)
3. [Keep it in memory]({{ site.url }}/2014/10/28/json-c-tutorial-part-3.html)
4. [Parsing]({{ site.url }}/2014/10/28/json-c-tutorial-part-4.html)

Any comments, improvements, typos / languages corrections are welcome!

{% include prevnext.html paramOutline="2014/10/28/json-c-tutorial-intro-outline.html" paramNext="2014/10/28/json-c-tutorial-part-1.html" %}
