---
layout: post
title:  "[Click Modular Router] Protocol implementation tutorial - intro"
date:   2015-9-15
---
[Click Modular Router](http://www.read.cs.ucla.edu/click/) is a pretty cool "modular packet processing and analysis" framework, the only problem is the harsh learning curve.
Our work group used this framework for a school project : a PoC of the [LISP protocol](http://en.wikipedia.org/wiki/Locator/Identifier_Separation_Protocol) on a virtual machine to explore the [NFV](http://en.wikipedia.org/wiki/Network_functions_virtualization) concept.

In spite of the difficulty to approach Click Modular Router, it has a lot of benefits and potential.
This network framework aims at autonomous network equipment, thus Click Modular Router isn't for your typical client side protocol.
If you want to have a fine control over a particular network system or you want to use an exotic protocol this tutorial is for you.
If you are still reading, be aware that (almost) everything you do with Click Modular Router can be deployed on a optimised xen virtual machine: [clickOS](http://cnp.neclab.eu/clickos).

This tutorial is an attempt at sharing "what I wish I knew before starting this school project".
I won't cover everything there is to know about Click Modular Router (optimisations, tasks scheduling...) because I don't know it either.
I'm going to go through the basics, just enough to start implementing a protocol.
Implementing entirely a protocol is complicated and time consuming (especially if you have numerous options and RFCs aren't quite fun to read) so I will use a dummy protocol for the example's sake.

> I'm not a native english speaker so if you notice language "problems", quirks or typos let me know. This also stands if you're a Click Modular Router guru!

#Specifications for the dummy protocol

The dummy protocol is an application protocol and it works on top of UDP. It's composed of a unique packet type :

{% highlight text %}
+-+-----+-- ~~ --+
|T| Len |  Data  |
+-+-----+-- ~~ --+
{% endhighlight %}

* `T` : The type of the packet on 1 bit (`0` for Request and `1` for Answer)
* `Len` : Just some length on 7 bits (is actually fixed)
* `Data` : The string to pass along max `sizeof(char) * 100` (thus 100 bytes)

This protocol won't do much:

* The user will input a string in a "raw UDP packet" from a specific port, generating a dummy request packet
* Upon reception of a dummy packet the Data will be printed
* If the Data corresponds to something we know how to respond to we generate a dummy answer
* We want to log all received answers and print them every X seconds

#Things to know before coding

A bit of background is needed before coding. Mainly you will need to know what an element is.

##Elements

An element is a software brick.
You link elements to others, yielding the configuration for Click Modular Router.
Elements should achieve one task and one task only (that's my point of view).
Elements connects to other elements using ports (indexed by a number), on those connections will transit packets.
A connection between two elements is unidirectional.
The force of Click Modular Router is the sheer number of already available elements, you won't have to do much code to implement our dummy protocol!
Concretely an element is a C++ class with some methods to implement.

Elements ports processing flows:

* PUSH: Push a packet
* PULL: Pull a packet
* AGNOSTIC: Take the orientation of the incoming/out-going link

Simply put it's the "packet processing flow" and you need to link an out-going push port of one element to an incoming push port of another element, same apply for PULL.
Most of the time you will use the AGNOSTIC packet flow, when doing this you can picture your element as a filter.
Considering a top to bottom packet flow, PUSH is often on top of the elements and PULL is at the bottom.
Some specific elements do the PUSH <-> PULL conversion, we will cover them in time.
Other processing flows exist but I never had to use them.

##Configuration

The configuration is a text file with a `.click` extension you provide as an argument to the `click` binary.
You can do a lot of things configuration wise but you will need very few.
Each line or link block is terminated by a semi-colon.
A link is as simple as '->'.

###Using elements
There are several ways to use an element in your configuration:

* `DummyElem`: simplest way to instantiate an element
* `DummyElem(arg1, ...)`: instantiate an element and provide arguments, like you would with a function

Also you can combine the previous declarations with a prefix to name your elements:
`myElem :: DummyElem(arg1)` creating a 'DummyElem' passing 'arg1' and naming it 'myElem'.

Implicitly '->' match port 0 (for source and destination), if you wish to link to another port you will need to specify it:
`ElemA[1] -> [3]ElemB` will send the output port number 1 of 'ElemA' to the input port number 3 of 'ElemB'.
Thus, `ElemA -> [1]ElemB` will send the output port number 0 of 'ElemA' to the input port number 1 of 'ElemB', nothing difficult here.

###Using variables

You can also define variables for your configuration with the following syntax: `define($IFACENAME enp2s0);`.
A specific syntax is available to ease the configuration of network interfaces: `AddressInfo(enp2s0 10.0.0.2 01:02:03:04:05:06);` you can then use 'enp2s0' for the IP or MAC address of a parameter.

###Other possibilities

I encourage you to go to [the dedicated wiki page](http://www.read.cs.ucla.edu/click/docs/language) to know more about the configuration language.
If you don't know where to start learn about element groups, they are quite useful.

##Installing Click Modular Router

I won't cover this because it's well done on the [github repository of the project](https://github.com/kohler/click/).
The only thing to do is to add the `--enable-local` flag for the configure step: all of our files will be in `elements/local/tuto` (you may want to create the folder now).
If you wonder what options to set for configure here is what you will _need_ to enable for this tutorial : `--disable-bsdmodule --disable-linuxmodule --enable-local`.

Hence I won't use the kernel modules, only the 'userlevel' mode for Click Modular Router: it's way more suitable for development.

##Implementing the Dummy protocol

I propose the following model:

* One file to define the protocol format 'DummyProto.hh'
* One element to "classify" the type of the packet 'DummyClassifier.{cc,hh}'
* One element to print the Data 'DummyPrinter.{cc,hh}'
* One element to log the past Data 'DummyLog.{cc,hh}'
* One element to answer (to a response) a packet 'DummyAnswer.{cc,hh}'
* One element to generate a request packet 'DummyRequest.{cc,hh}'

I will detail the elements before implementing them. Here is an overview of the connections between elements (note the use of standard elements) :

![provisional_config](/assets/Click_tuto_config.svg)

#Outline

I will do a "per file basis" tutorial outline:

1. [DummyProto](Click-Modular-Router-tutorial-part1.html) - The protocol definition
2. [DummyPrint and DummyLog](Click-Modular-Router-tutorial-part2.html) - Printing and logging information
3. [DummyClassifier](Click-Modular-Router-tutorial-part3.html) - The Classifier
4. [DummyRequest](Click-Modular-Router-tutorial-part4.html) - Generating a Request packet from a UDP packet and a handler
5. [DummyAnswer](Click-Modular-Router-tutorial-part5.html) - Respond to a Request packet
6. [The complete solution at work](Click-Modular-Router-tutorial-part6.html)
