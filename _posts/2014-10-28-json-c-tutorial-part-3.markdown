---
layout: post
title:  "[json-c] Tutorial part 3: Keep it in memory"
date:   2014-10-28
tags:   tutorial json-c
---
You might have noticed the `json_object_put()` at the end of the previous examples, let's talk about the other related fonction `json_object_get()`.

Those fonctions manipulate the refcount of an `json_object`. If you know what a refcount is, just take a look at the prototypes then go to the next page.

{% highlight C %}
struct json_object * json_object_get(struct json_object *obj);
int json_object_put(struct json_object *obj);
{% endhighlight %}

`json_object_get()` return `obj` (for convenience).`json_object_put()` returns 1 if and only if `obj` was freed, otherwise 0 is returned.

#What the hell is a refcount ?

"refcount" is short for "reference counting", it's a technique to share a pointer to some data across multiple programs / pieces of code.

For example, you need to share a part of a `json_object` with another program. Your programs have to point towards the same information. Additionally, you want to free the memory occuped by the `json_object` asap. Without refcount this (simple) problem will be solved by a synchronisation of some sort, this can be tricky and don't scale very easily.

With refcounts it's simple, you need to mark a specific `json_object` as "in use by X programs" using `json_object_get()` to increment the refcount. When a program don't need anymore the piece of data it decrements the refcount for the `json_object` with `json_object_put()`. When the refcount reach 0, the `json_object` is freed.

Refcounts become *very* useful when you have to "mix" two `json_object` into one using as few memory as possible.

When you create a `json_object` it has a refcount of 1.

So, when you add an array to object, what appends? "With great power comes great responsibility" so it's the encompassing `json_object` that now have the responsability to increment / decrement refcounts of every child `json_object`.

> If you want to get an idea of how implementing refcounts is like, head over here [www.xs-labs.com/en/archives/articles/c-reference-counting/](http://www.xs-labs.com/en/archives/articles/c-reference-counting/)

#Example

{% gist alan-mushi/19546a0e2c6bd4e059fd json_refcount.c %}

> Note: You really want to compile this program with the "-g" option.
> In case you made an error on refcount valgrind will give plenty more informations with debugging symbols!

Because memory manipulation can be tricky, let's run our program with valgrind / memcheck :

{% highlight text %}
==27537== Memcheck, a memory error detector
==27537== Copyright (C) 2002-2013, and GNU GPL'd, by Julian Seward et al.
==27537== Using Valgrind-3.10.0 and LibVEX; rerun with -h for copyright info
==27537== Command: ./json_refcount
==27537== 

obj1 in plaintext: 
---
{ "peace-code": 1234 }
---

obj2 in plaintext: 
---
{ "death-ray-code": 4321 }
---

Before the glitch in the matrix: 
---
[ 1234, 4321 ]
---

After the glitch in the matrix: 
---
[ 4321, 1234 ]
---

[>] Unlocking peace with code at index 0 of res: 4321
==27537== 
==27537== HEAP SUMMARY:
==27537==     in use at exit: 0 bytes in 0 blocks
==27537==   total heap usage: 19 allocs, 19 frees, 2,010 bytes allocated
==27537== 
==27537== All heap blocks were freed -- no leaks are possible
==27537== 
==27537== For counts of detected and suppressed errors, rerun with: -v
==27537== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
{% endhighlight %}

No errors, yeah! This example is very simple but when code complexity increase the whole refcount "thing" is hard to pin-point.

> Note: valgrind / memcheck isn't always right (but often is) so double check the errors.

{% include prevnext.html paramPrev="2014/10/28/json-c-tutorial-part-2.html" paramOutline="2014/10/28/json-c-tutorial-intro-outline.html" paramNext="2014/10/28/json-c-tutorial-part-4.html" %}