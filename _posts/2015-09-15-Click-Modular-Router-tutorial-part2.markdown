---
layout: post
title:  "[Click Modular Router] Protocol implementation tutorial - part 2 DummyPrint and DummyLog"
date:   2015-9-15
---

# Element skel generation

If you want to use this tutorial without copy/paste, or if you are developing other click elements, you may/will notice how repetitive the class declarations and simple methods are to write.
As I don't quite enjoy repetitive tasks, here is a script that generates "skel" click elements:

{% gist alan-mushi/417b1a77a62ab3f04388 skel_gen.sh %}

# DummyPrint

The role of this element is to print the `Data` field of any incoming packet.
The incoming packets must be stripped of their headers, leaving only the UDP data.
To differentiate requests from answers we also want to print the type of packet.
Because we are doing this classification we can take the opportunity to set the annotation for the packet.

Annotations have multiple types (more in the [packet class documentation](http://read.cs.ucla.edu/click/doxygen/class_packet.html)) and are additional information on a packet.
Those annotations are indexed using byte length and an area is reserved for it in every packet.

We are setting this annotation so the DummyClassifier can dispatch packets to outputs solely based on the annotation value.
Because we need our annotation index to be shared between the "getter" (DummyClassifier) and the "setter" (DummyPrint) you need to put it as a constant in a file both elements will include.
Therefore, the designated spot is in DummyProto.hh:

{% highlight C %}
#define DUMMY_CLASSIFY_ANNO_OFFSET 4
{% endhighlight %}

> Note that the annotation information is redundant with the one set in the packet.
> More so because the incoming packet for both DummyPrint and DummyClassifier must start with our protocol data.
> However, using annotations can be very useful if you don't know if your packet will be stripped of the information.
> Here the use of an annotation mechanism is idiotic but the notion isn't.

Setting an annotation is trivial so let's move on to the "print" part.
To print something from an element you use `click_chatter(...)`, it's roughly the equivalent for a `print()` with an implicit '\n'.

Last difficulty, the length of the string contained in the `Data` field of the protocol.
Because you can't always assume that it will be NULL terminated you must build the string with an upper bound.

> The string in `Data` will be NULL terminated if the string is smaller than the available space.

Finally, here is the element's class definition:

{% gist alan-mushi/417b1a77a62ab3f04388 DummyPrint.hh %}

And the implementation:

{% gist alan-mushi/417b1a77a62ab3f04388 DummyPrint.cc %}

The only thing left to explain is the first and last line of `simple_action(...)`.
Because we expect a packet stripped to the UDP data, we get the data pointer of the packet and cast it to our protocol structure.
A good visual explanation of the packet zones and pointers [documented](http://read.cs.ucla.edu/click/doxygen/class_packet.html).
Finally, returning the packet is the same as sending it to the element's first output.

Note that the `simple_action(...)` method is often the one you need, especially in AGNOSTIC flow, think of it as a filter applied to each packet passing through your element.

# DummyLog

This element is used to display received answers periodically.
The reason for this element to exist is to demonstrate the use of [Timers](http://read.cs.ucla.edu/click/doxygen/class_timer.html) and of element configuration (using the `configure(...)` method).

For this element we assume that the input packet have `packet.data()` pointing to UDP data.
Also we expect the input packet to be of type dummy answer.

Let's dive in with the class definition file:

{% gist alan-mushi/417b1a77a62ab3f04388 DummyLog.hh %}

First you note the attributes:

* `_answers` is used to collect answers strings
* `_tick` is used to define the time interval between timer ticks
* `_timer` is pretty self-explanatory

Then the two additional methods:

{% highlight C %}
void run_timer(Timer *t); // Triggered on a tick
int initialize(ErrorHandler *);
int configure(Vector<String> &conf, ErrorHandler *errh);
{% endhighlight %}

Timer implementation is the following:

* Inherit of timer for the element: `DummyLog::DummyLog() : _timer((Element *) this) { };`
* Initialize `_timer` and schedule it:
{% highlight C %}
int DummyLog::initialize(ErrorHandler *) {
	_timer.initialize((Element *) this);
	_timer.schedule_now();

	return 0;
}
{% endhighlight %}
* Define what to do when the timer is triggered, don't forget to reschedule the timer unless you want a one-off action:
{% highlight C %}
void DummyLog::run_timer(Timer *t) {
	assert(&_timer == t);
	_timer.reschedule_after_sec(_tick);
	/* ... */
}
{% endhighlight %}

That's it, here is the complete implementation of the DummyLog element:

{% gist alan-mushi/417b1a77a62ab3f04388 DummyLog.cc %}

The configuration of our element in this example is pretty straight-forward but it can be very complex depending on what you need to "feed" your element.
The above configuration allows us to set a default value for `_tick`.
In case you need a custom value you would write your click configuration file like this:

{% highlight text %}
...
-> DummyLog(TICK 3)
...
{% endhighlight %}

Finally, we need to kill the packet in `simple_action(...)` because our element don't have an output port.
Nothing crazy here, just be careful about the values you wish to save in the vector, if you point vector's data to freed areas of memory it's unfortunate (to say the least).

{% include prevnext.html paramPrev="2015/09/15/Click-Modular-Router-tutorial-part1.html" paramOutline="2015/09/15/Click-Modular-Router-tutorial-intro.html" paramNext="2015/09/15/Click-Modular-Router-tutorial-part3.html" %}
