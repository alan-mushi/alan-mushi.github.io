---
layout: asap-post
title:  "pulseaudio toggle mute for Chromium"
date:   2015-11-08
category: asap
---

EDIT: The problem is fixed for me with the latest release of chromium (46.0.2490.86-1) so there is no reason to use this awful hack.

So I had a little problem with the sound in Chromium, for some reason (yet to identify) Chromium starts muted.
You can observe this only when you try to play a video and open `pavucontrol`. The solution is to unmute it by opening `pavucontrol` and click on the unmute button but it takes too much clicking away for me ;).

Here is a script that does exactly that, note that it can be re-purposed for any program name you wish:

{% gist alan-mushi/0949f12fd82bb042a02d %}
