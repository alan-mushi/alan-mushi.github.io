---
layout: post
title:  "[Click Modular Router] Protocol implementation tutorial - part 1 DummyProto"
date:   2015-9-15
---

Adding a protocol structure to Click Modular Router is as simple as defining the structure in itself:

{% highlight C %}
struct DummyProto {
#if CLICK_BYTE_ORDER == CLICK_BIG_ENDIAN
	unsigned int T : 1;
	unsigned int Len : 7;
#elif CLICK_BYTE_ORDER == CLICK_LITTLE_ENDIAN
	unsigned int Len : 7;
	unsigned int T : 1;
#endif
	char Data[DUMMYPROTO_DATA_LEN];
} CLICK_SIZE_PACKED_ATTRIBUTE;
{% endhighlight C %}

If you are not familiar with the notation, `unsigned int Len : 7;` is called a bitfield and creates a `int` field of size 7 bits.
Because of this notation, the compiler might be tempted to include padding between fields hence `CLICK_SIZE_PACKED_ATTRIBUTE` (defined as `__attribute__((packed))`).
This simple line is very important because it forces the compiler to arrange the bitfields exactly as told, without padding.
`CLICK_BYTE_ORDER` is used to adjust the fields position according to the byte order.

The above is the strict minimum to define a protocol structure but you may need some additional informations.
Here is the final file with all you need:

{% gist alan-mushi/417b1a77a62ab3f04388 DummyProto.hh %}

{% include prevnext.html paramOutline="2015/09/15/Click-Modular-Router-tutorial-intro.html" paramNext="2015/09/15/Click-Modular-Router-tutorial-part2.html" %}
