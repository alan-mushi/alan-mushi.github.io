---
layout: post
title:  "[Click Modular Router] Compile a file that isn't an element"
date:   2015-03-01
---

A [simple paragraph in the FAQ](http://read.cs.ucla.edu/click/faq#how-can-i-make-click-compile-a-c-file-that-doesn-t-contain-an-element) is all there is about compiling a non element file in click. For a school project we had to compile a set of functions that couldn't fit in an element. Specifically we needed those functions to be shared and used across multiple elements. Because we spent/lost quite some time poking around trying to make it work here is a minimalistic example.

The following was tested in userlevel mode although it should work fine in other modes.

We have 2 sets of files: `printhello.{cc,hh}` contains the `print_hello()` function that the element `userelem.{cc,hh}` call in `simple_action(...)`.

> The **file extensions matter** a great deal, if you don't use .cc and .hh for your filenames, click won't find, compile nor use them!

Here are the files:

{% gist alan-mushi/c186a0d90f63e92ec7c5 printhello.cc %}
{% gist alan-mushi/c186a0d90f63e92ec7c5 printhello.hh %}
{% gist alan-mushi/c186a0d90f63e92ec7c5 userelem.hh %}
{% gist alan-mushi/c186a0d90f63e92ec7c5 userelem.cc %}

You want to put those in `elements/local` if you used the `--enable-local` configure option, otherwise `elements/userlevel` should be fine.

At this point you want to make sure that click sees your elements. `make elemlist` will generate a list of all elements, `grep -i userelem userlevel/elements.conf` _should_ return/find something, if not you will have to solve this before continuing.

Run the usual `make` to compile (tip: add `-j X` where X is the number of cores of your processor to speed-up the compilation).

The click configuration file is as simple as possible (I put this file at the root of click for convenience):

{% gist alan-mushi/c186a0d90f63e92ec7c5 hello.click %}

Finally run click in usermode with `sudo ./userlevel/click ./hello.click` (quit with `^C`).

Here is the expected print:

{% highlight bash %}
$ sudo ./userlevel/click ./hello.click 
A word from a non element file : HELLO!
{% endhighlight %}
