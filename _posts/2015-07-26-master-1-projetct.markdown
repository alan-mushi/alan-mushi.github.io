---
layout: post
title:  "[Network] PoC of the LISP protocol on Click Modular Router"
date:   2015-07-26
tags:	network school
---

This was in fact our (group of 6 people) project for the first year of Master and... it's finally [Open Sourced](https://github.com/LISP-on-Click/LISP-Project).
The goal of this project was to implement the LISP protocol on a modified version of Click Modular Router to run the code in a Xen VM.

If you're thinking "LISP like the programming language ?" well no, LISP as in "Locator/ID Separation Protocol", ([wikipedia](https://en.wikipedia.org/wiki/Locator/Identifier_Separation_Protocol) have a clear explication). On the other hand we have [Click Modular Router](https://github.com/kohler/click/), a framework made in C++ to ease the development of packet manipulation (at every programmable level of the OSI model).

> Click Modular Router is pretty hard to grasp, I'm making a tutorial (oriented towards protocol implementation) about it but I don't know when it's going to be ready. In the mean time, the best resource is [the thesis](http://pdos.csail.mit.edu/papers/click:tocs00/paper.pdf) made by the creator of this framework.

As you can see, pretty neat tech is involved. Sadly we couldn't manage to achieve the ultimate experiment: doing a Xen VM migration (the VM would be a LISP endpoint), we ran out of time. We could prove that our implementation, even if partial of the protocol, worked using... a ICMP request/response. Yes it's rather small and simple, but it can prove that it's working as it should.

In the end this project was hard (you can't imagine the number of -metaphorical- walls we hit) but interesting and fit right in the whole "Cloud" hype. There is still a lot of work to do on it to make suitable for production use or stable use for that matter ;).

If you didn't caught it at the beginning, the link for the git repository is: [https://github.com/LISP-on-Click/LISP-Project](https://github.com/LISP-on-Click/LISP-Project), there is documentation about everything on it.
