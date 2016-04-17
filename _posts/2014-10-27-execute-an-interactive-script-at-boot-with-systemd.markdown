---
layout: post
title:  "Execute an interactive script at boot with systemd"
date:   2014-10-26
tags:   systemd script
---
Everything is in the title, well almost: the script to launch is a simple ncurses dialog in tty2.

I couldn't find it as a whole on Internet but I needed it to make the installer for the tizen-installer image (see [this wiki page](https://wiki.tizen.org/wiki/Install_tizen_image) for details).

This window is made by "dialog" (the program). If you don't already have it, check out [dialog's home page](http://invisible-island.net/dialog/).
Many *nix distributions (if not all) already have a packet for it.

# Systemd service file

If you didn't know it, every systemd service has a file. This file indicates many metadata/informations, checkout the `systemd.service` man page.

Systemd service files are usually stored in `/usr/lib/systemd/system`. Our file `simple-window-dialog.service` is quite simple:

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

Let's go through some of the settings, as aforementioned the script will run on tty2 so "After" and "TTYPath" must be set accordingly. The value of "TTYPath" is actually used by the following options:

* "TTYReset" clear the tty (as in the `reset` command)
* "TTYVHangup" conveniently disconnect users of the tty
* "StandardInput" connect stdin to the tty

For more on those options see the `systemd.exec` man page.

Systemd should now see our service:

{% highlight text %}
# systemctl status simple-window-dialog.service
● simple-window-dialog.service - Simple interactive dialog window
   Loaded: loaded (/usr/lib/systemd/system/simple-window-dialog.service; static)
      Active: inactive (dead)
{% endhighlight %}

As you can see this service is currently useless, let's make it start at boot. There is two way to do it and depends if you can interact with the system *before* his first launch.

## Start a service before the first launch

If you can't use an interactive shell, typically you are creating a bootable image, you can still enable your service with a symlink:

{% highlight text %}
# ln -sf /usr/lib/systemd/system/simple-window-dialog.service /usr/lib/systemd/system/default.target.wants/simple-window-dialog.service
{% endhighlight %}

> You may need to create the `/usr/lib/systemd/system/default.target.wants/` folder.

## Enable a service (the handy way)

An interactive shell simplify the process, it really don't do much more than do the symlink for you. Type `systemctl enable simple-window-dialog.service` and your system will start at boot.

# The script file

This file is to be placed in `/usr/bin/dialog-hello.sh` (don't forget to add executable permissions):

{% highlight bash %}
#!/bin/bash

sleep 5

chvt 2

dialog --msgbox "Hello world!" 10 40
{% endhighlight %}

`chvt 2` means "change foreground terminal to tty2", `dialog --msgbox "Hello world!" 10 40` create a rectangular (10 * 40) message box with a "OK" button and our message. `sleep 5` is more hackish: if you run this script (at boot) with a login manager or a graphical environment, you won't end-up on tty2. For example I use slim as graphical login manager and it steals the focus, even with a "After" dependency in the systemd service. However, the sleep command in totally useless if you don't have a graphical environment (automatically launched that is).

Reboot and enjoy! (Ctrl + Alt + F7 to get back to the graphical environment).

# To the infinite and beyond

You can do many things to improve the script, after all this is only a PoC:

* Define better colors for dialog (search for `.dialogrc` in the dialog man page)
* Force the kernel to print less messages in terminal (the dialog window can be bullied by those) with the "quiet" boot option or special values in printk.
* A (much) more complex script, dialog can do a lot, try it out!
