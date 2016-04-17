---
layout: post
title:  "[Click Modular Router] Using Handlers in userlevel"
date:   2015-03-22
---

> This will only be focused on the userdriver, the [linuxmodule](http://www.read.cs.ucla.edu/click/docs/linuxmodule) is slightly different.

# Intro
Let's say you wrote your element, this element has a parameter, for example an interval value in seconds. When you instantiate the element (by running click with you configuration file, creating and configuring your element) you pass this interval as a fixed parameter. Now what about changing it, dynamically, without restarting click? You can do this with a handler, this handler concept is great if you need to control your elements parameters to react to an event from the host. Most standard elements have this, for this example we will use `TimedSource`.

So a handler is just some kind of distant function to read/write parameters/options of running elements.

# ControlSocket
Connecting to a handler in userlevel is achieved by a tcp or a unix socket. In this example I will only demonstrate the tcp version because it's the most interesting (you can configure a router on another computer across the network!). If you need extra security, consider the unix socket instead because the tcp commands are sent in **clear text**. The server for this tcp connexion is the click router itself and it implements a simple command syntax that [I won't cover](http://www.read.cs.ucla.edu/click/elements/controlsocket#server-commands). The client side is a simple java application, if you are not satisfied with this application (it's not great) you can always code your own client.

You have two choices to run this tcp connexion:

- Passing a parameter when starting click with the userdriver: `--port <port>` (`-p <port>` for short)
- Adding a special element to your configuration file: `ControlSocket(tcp, <port>)`

More details about the [userdriver here](http://www.read.cs.ucla.edu/click/docs/userdriver) and the [ControlSocket here](http://www.read.cs.ucla.edu/click/elements/controlsocket).

The default java client application is in `apps/ClickController/`. It lacks a makefile so here is mine:

{% highlight text %}
DSTDIR=.
HOST=localhost
PORT=1111

all:
	javac -d $(DSTDIR) *.java

clean:
	rm *.class

run: all
	java ClickController $(HOST) $(PORT)
{% endhighlight %}

# The simplest example

`TimedSource` has `INTERVAL` and `DATA` handlers but I will only demonstrate parameter reconfiguration with `INTERVAL`. As stated before I will use tcp to control the handlers, here is my click configuration file:

{% highlight C++ %}
/*
 * Uncomment the following line if you wish to run the ControlSocket using the
 * dedicated element.
 */
//ControlSocket(tcp, 1111);

TimedSource(INTERVAL 2)->Print->Discard;
{% endhighlight %}

Nothing ground-breaking, every 2 seconds a packet is generated, printed and discarded.

Running click with the userdriver is as simple as:

```
~/click/ $ sudo ./userlevel/click --port 1111 test.click
```

Your router is printing a packet every two seconds ? It's too slow, let's change that! Launching the java client application (`make run`) you should see this:

![ClickController](/assets/ClickController.png)

Simply click on the element's folder and select the parameter file you wish to modify, enter a new value for this parameter and press the "Change" button:

![ClickController_config](/assets/ClickController_config.png)

That's it, your packets should print faster/slower now, this example is extremely basic but you get the idea.

> Tip: clicking on the "handlers" file in an element's folder list all the parameters you can access.
> Permissions are 'r' for read and 'w' for write.

I won't cover how to code those handlers because there is, for once, plenty of very comprehensive examples/implementations in the standard library of elements.
