---
layout: post
title:  "[Click Modular Router] Protocol implementation tutorial - part 5 DummyAnswer"
date:   2015-9-15
---

Next, the DummyAnswer element.
His job is to store '(request -> answer)' associations and reply to the request with a given answer.
Of course, if no answer matching the request is known by the element the request gets discarded.
We use a [Hashtable](http://read.cs.ucla.edu/click/doxygen/class_hash_table.html) to store the requests and associated answers.
Hashtable objects are easy to use, the interesting question is how to fill it, to do so I used handlers.
Think of handlers as an interface to read or change something in an element that is being used by a click router instance.
Handlers need to be exposed as you launch click, you may do so in two fashions:

1. Add a special element in your click configuration file
2. Launch click with options (unix socket or tcp port)

I chose the later with the network variant enabled with the flags `-p 3333`.
The port number choice (3333) is totally arbitrary.
The protocol used to communicate with handlers is [well documented](http://read.cs.ucla.edu/click/elements/controlsocket#server-commands) and a Java/GUI based program exists.
In order to test things out you might not appreciate clicking away in a GUI but rather prefer executing a command, for this reason I made 2 scripts able to respectively [read](https://gist.github.com/alan-mushi/417b1a77a62ab3f04388#file-read_handler-sh) and [write to](https://gist.github.com/alan-mushi/417b1a77a62ab3f04388#file-add_handler_mapping-sh) a handler.

I chose a format to register a '(request -> answer)' association: `request_string|answer_string`.
This format is quite easy to deal with and to script.

Moving on to the header element's class definition file:

{% gist alan-mushi/417b1a77a62ab3f04388 DummyAnswer.hh %}

`read_callback(...)` and `write_callback(...)` are arbitrary names you can name your handler methods as you wish.
Also take note of the `add_handlers()` method.

Implementing handers is done in 3 steps:

1. Define an ID for your handler (here it's `enum { H_MAP };`)
2. Implement your read and/or write methods
3. Register your methods

{% gist alan-mushi/417b1a77a62ab3f04388 DummyAnswer.cc %}

At this point `simple_action(...)` mustn't need much explanations, however watch out how you access the Hashtable.
Indeed `_msgs.get(s)` simply return the matching element if there is one and a "NULL default element" if it's not found.
Another notation with slightly different semantics, the `[]` operator creates a new entry with "NULL default element" if nothing is found.
Here "NULL default element" is an empty string because the type of our Hashmap is `<String, String>`, more on this in [the documentation of HashMap](http://read.cs.ucla.edu/click/doxygen/class_hash_table.html).

Don't mind too much the boiler plate code in `write_callback(...)` to split the string and ensure that lengths are compatible with our protocol `Data` field.
However note that when instantiated the DummyAnswer element don't come with pre-filed '(request -> answer)' associations.

{% include prevnext.html paramPrev="2015/09/15/Click-Modular-Router-tutorial-part4.html" paramOutline="2015/09/15/Click-Modular-Router-tutorial-intro.html" paramNext="2015/09/15/Click-Modular-Router-tutorial-part6.html" %}
