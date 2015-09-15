---
layout: post
title:  "[Click Modular Router] Protocol implementation tutorial - part 4 DummyRequest"
date:   2015-9-15
---

Now that we can print and classify our dummy protocol packets it's time to generate some, namely dummy requests packets.
To create a dummy request packet you need to pass along a string to DummyRequest as a UDP packet containing the string and a dummy request packet will be generated.
The way to inject a "request string" might seem odd but it's a very simple thing to implement.
Note that injecting a string could be done using click handlers (I will explain later what those are).

In the following we assume that the incoming packet have the `data()` pointer at the start of the request string.
Thus to create a dummy request packet from the incoming packet containing the string you must:

1. Create a dummy protocol structure
2. Fill the structure (with appropriate `T`, `Data` and an arbitrary `Len`)
3. Create the packet and copy the structure to it

> Note that you may also create the packet, cast the `data()` pointer to your structure and fill the pointer.
> I prefer to do it in the 3 steps above for clarity.

The element class definition is pretty standard with the addition of a function described above and the [headroom](http://read.cs.ucla.edu/click/doxygen/class_packet.html#1c32d409a895a910bf053e31553dc5a7) for the dummy request packet:

{% gist alan-mushi/417b1a77a62ab3f04388 DummyRequest.hh %}

The implementation is pretty easy, you just need to be careful about the length of the incoming string.
I chose to pad smaller (smaller than `DUMMYPROTO_DATA_LEN` defined in the `DummyProto.hh`) strings with '\0', longer strings are truncated.

{% gist alan-mushi/417b1a77a62ab3f04388 DummyRequest.cc %}

{% include prevnext.html paramPrev="2015/09/15/Click-Modular-Router-tutorial-part3.html" paramOutline="2015/09/15/Click-Modular-Router-tutorial-intro.html" paramNext="2015/09/15/Click-Modular-Router-tutorial-part5.html" %}
