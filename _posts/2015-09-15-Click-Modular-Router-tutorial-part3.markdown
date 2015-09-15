---
layout: post
title:  "[Click Modular Router] Protocol implementation tutorial - part 3 DummyClassifier"
date:   2015-9-15
---

The DummyClassifier element follow this dead simple algorithm:

{% highlight text %}
If packet.anno = ANNO_REQUEST Then
	output(0) <- packet
Else If packet.anno = ANNO_ANSWER Then
	output(1) <- packet
Else
	output(2) <- packet
Fi
{% endhighlight %}

Of course this assumes that the packet have the annotation set.
Note that we use a PUSH port processing with 3 outputs.

Therefore the code pretty much writes it-self:

{% gist alan-mushi/417b1a77a62ab3f04388 DummyClassifier.hh %}
{% gist alan-mushi/417b1a77a62ab3f04388 DummyClassifier.cc %}

{% include prevnext.html paramPrev="2015/09/15/Click-Modular-Router-tutorial-part2.html" paramOutline="2015/09/15/Click-Modular-Router-tutorial-intro.html" paramNext="2015/09/15/Click-Modular-Router-tutorial-part4.html" %}
