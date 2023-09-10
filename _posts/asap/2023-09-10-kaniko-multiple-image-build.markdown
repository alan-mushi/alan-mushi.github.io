---
layout: asap-post
title:  "Kaniko executor for multiple builds require `--cleanup`"
date:   2023-09-10
category: asap
---

We rely heavily on kaniko for building the RedHat CTF docker image challenges. Once I noticed an odd behaviour in an image: challenge B was actually executing challenge A, with the image for A being built just prior to B's. The build log offered no clues and the situation fixed itself after a couple of changes to B's startup code.

Some time later, a challenge contributor brought to my attention that his image seemed to break the build pipeline. That is his challenge was building fine but any other after that failed with unexpected errors (softlinks being too deep on `/var/mail`). His challenge was also using a different distribution as a base image.

Looking deeper into the topic, it turns out that one flag was missing from kaniko executor: `--cleanup`. This flag is necessary _when kaniko is used to build multiple images in one go_. From what I gather, kaniko doesn't employ `chroot` but instead uses the file system directly, without `--cleanup` we get remnant of images built before.