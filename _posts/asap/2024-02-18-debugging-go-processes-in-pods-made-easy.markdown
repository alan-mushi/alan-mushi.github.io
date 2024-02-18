---
layout: asap-post
title:  "Debugging go processes in pods made easy"
date:   2024-02-18
category: asap
---

It can be a bit hard to follow what Kubernetes/OpenShift controllers/operators
are doing from the source code, in these cases it's helpful to plug in a
debugger and follow along in your IDE of choice. Except debugging a go process
in a remote pod on some cluster can be a bit tedious. So I made
[debug-me-maybe](https://github.com/rh-tguittet/debug-me-maybe) to simplify
this process, it uploads the delve debugger, runs it on a pid of your choice,
and tunnels back the socket from the pod to your machine.

This is completely inspired by [ksniff](https://github.com/eldadru/ksniff)
since I replaced the wireshark bits for the debugging ones.
