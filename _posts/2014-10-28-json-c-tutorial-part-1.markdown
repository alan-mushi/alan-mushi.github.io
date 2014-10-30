---
layout: post
title:  "[json-c] Tutorial part 1: Print everything"
date:   2014-10-28
tags:   tutorial json-c
---
json-c uses the `json_object` structure to store a json representation. This structure is marked `typedef` but I will always write `struct`, for clarity's sake.

2 functions exist to print the `json_object` structures:

{% highlight C %}
const char * json_object_to_json_string(struct json_object *obj);
const char * json_object_to_json_string_ext(struct json_object *obj, int flags);
{% endhighlight %}

`json_object_to_json_string(obj)` is in fact a call to `json_object_to_json_string_ext(obj, JSON_C_TO_STRING_SPACED)`.

The `flag` attribute of `json_object_to_json_string_ext()` are:

* JSON_C_TO_STRING_PLAIN
* JSON_C_TO_STRING_SPACED
* JSON_C_TO_STRING_PRETTY
* JSON_C_TO_STRING_NOZERO

Those flags can be combined using the `|` operator.

Example's source code:
{% gist alan-mushi/19546a0e2c6bd4e059fd json_print.c %}

Example's output:

{% highlight text %}
$ ./json_print
Using printf(): "Mum, clouds hide alien spaceships don't they ?", "Of course not! ("sigh")"

Using json_object_to_json_string_ext():

Flag JSON_C_TO_STRING_PLAIN:
---
{"question":"Mum, clouds hide alien spaceships don't they ?","answer":"Of course not! (\"sigh\")"}
---

Flag JSON_C_TO_STRING_SPACED:
---
{ "question": "Mum, clouds hide alien spaceships don't they ?", "answer": "Of course not! (\"sigh\")" }
---

Flag JSON_C_TO_STRING_PRETTY:
---
{
  "question":"Mum, clouds hide alien spaceships don't they ?",
  "answer":"Of course not! (\"sigh\")"
}
---

Flag JSON_C_TO_STRING_NOZERO:
---
{"question":"Mum, clouds hide alien spaceships don't they ?","answer":"Of course not! (\"sigh\")"}
---

Flag JSON_C_TO_STRING_SPACED | JSON_C_TO_STRING_PRETTY:
---
{
   "question": "Mum, clouds hide alien spaceships don't they ?",
   "answer": "Of course not! (\"sigh\")"
 }
---
{% endhighlight %}

One thing worth noting, the `"` character is escaped for security reasons.

{% include prevnext.html paramOutline="2014/10/28/json-c-tutorial-intro-outline.html" paramNext="2014/10/28/json-c-tutorial-part-2.html" %}