---
layout: asap-post
title:  "Execute an interactive script at boot with systemd"
date:   2014-10-26
tags:   systemd script
category: asap
---

# Goal

Execute an interactive script on tty2 (using dialog) at boot with systemd.

# Files

`/usr/lib/systemd/system/simple-window-dialog.service`:

{% highlight text %}
[Unit]
Description=Simple interactive dialog window
After=getty@tty2.service

[Service]
Type=oneshot
ExecStart=/usr/bin/dialog-hello.sh
StandardInput=tty
TTYPath=/dev/tty2
TTYReset=yes
TTYVHangup=yes

[Install]
WantedBy=default.target
{% endhighlight %}

`/usr/bin/dialog-hello.sh` (add execution permission):

{% highlight bash %}
#!/bin/bash

sleep 5

chvt 2

dialog --msgbox "Hello world!" 10 40
{% endhighlight %}

# Enable the systemd service

{% highlight text %}
# systemctl enable simple-window-dialog.service
{% endhighlight %}

Or

{% highlight text %}
# ln -sf /usr/lib/systemd/system/simple-window-dialog.service /usr/lib/systemd/system/default.target.wants/simple-window-dialog.service
{% endhighlight %}

# Run

Reboot (if the systemd setup is correct you should see the dialog window) enjoy.
