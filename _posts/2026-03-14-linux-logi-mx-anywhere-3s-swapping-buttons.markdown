---
layout: post
title:  "Persist Button Swapping for Logi MX Anywhere 3S on Linux with libratbag, udev, and systemd"
date:   2026-03-14
---

My old faithful Logi MX Anywhere 2S mouse is no more, I replaced it with the
new revision: Logi MX Anywhere 3S. Terrible branding name aside, the new mouse
has an annoying difference for my workflow: the mouse wheel click and middle
button clicks have switched! I love select-to-copy and middle-click-to-paste on
Linux, having two text copy buffers to so practical. This change is really
bothersome, but at least we can remap buttons... in Logitech's software
available only to Windows and Macs. After short-lived "could it run under
wine?" experiment, I tried on a Windows only to discover the button swap was
not saved to the mouse :(

Let's see how/what we can do on Linux then. Some research and a fortuitous
hacker news comment later, we have the choice
between:

- solaar
- libratbag (+ piper)

Playing around a bit with solaar:

- Only accepts to show you the UI on GNOME/X11 for the first launch?!
- I could change the button for the middle click from the mouse wheel to the
  middle button, but somehow not the reverse

Results with libratbag+piper were more encouraging, button swap was ok... until
the mouse reconnected and/or the machine rebooted, then you have to go through
the config again. Ugh.

Running a script calling ratbagctl (libratbag config utility) at boot to set
the button swap can't work since the mouse won't be connected. That script also
needs to run every time the mouse reconnects (after disconnecting due to
inactivity). Ok, udev rules it is.

General plan:

0. Install libratbag+piper, use piper's UI to do the configuration, observe and
   replicate the configuration with ratbagctl
1. Create a udev rule to trigger our ratbagtl commands when the mouse connects:
   `udev rule --creates--> systemd device --triggers--> systemd unit` (more
    details on why below)
2. Enjoy muscle memory clicking the right buttons

Finding an event to anchor our udev rule to:

{% highlight bash %}
$ udevadm monitor -u -s hid -p
monitor will print the received events for:
UDEV - the event which udev sends out after rule processing

UDEV  [10564.279056] add      /devices/virtual/misc/uhid/xxxx:yyyy:zzzz.000A (hid)
ACTION=add
DEVPATH=/devices/virtual/misc/uhid/xxxx:yyyy:zzzz.000A
SUBSYSTEM=hid
HID_ID=xxxx:0000yyyy:0000zzzz
HID_NAME=MX Anywhere 3S
HID_PHYS=xx:xx:xx:xx:xx:xx
HID_UNIQ=yy:yy:yy:yy:yy:yy
MODALIAS=hid:bxxxxg0001v0000yyyyp0000zzzz
SEQNUM=6324
USEC_INITIALIZED=10564277129
DRIVER=logitech-hidpp-device

UDEV  [10565.141016] bind     /devices/virtual/misc/uhid/xxxx:yyyy:zzzz.000A (hid)
ACTION=bind
DEVPATH=/devices/virtual/misc/uhid/xxxx:yyyy:zzzz.000A
SUBSYSTEM=hid
DRIVER=logitech-hidpp-device
HID_ID=xxxx:0000yyyy:0000zzzz
HID_NAME=Logitech MX Anywhere 3S
HID_PHYS=xx:xx:xx:xx:xx:xx
HID_UNIQ=yy:yy:yy:yy:yy:yy
MODALIAS=hid:bxxxxg0001v0000yyyyp0000zzzz
SEQNUM=6332
USEC_INITIALIZED=10565139521
{% endhighlight %}

Let's wip this into a udev rule that will match the "bind" action for our HID
device, tag the event for systemd, and create a named systemd device alias:

{% highlight bash %}
root# cat /etc/udev/rules.d/90-logi-mx-anywhere-button-switch.rules
###
# Swaps the mouse click and the "button behind the mouse" click
###

# Debug version
#SUBSYSTEM=="hid", ACTION=="bind", ENV{HID_UNIQ}=="yy:yy:yy:yy:yy:yy", ENV{HID_PHYS}=="xx:xx:xx:xx:xx:xx", OPTIONS="log_level=debug", TAG+="systemd", ENV{SYSTEMD_ALIAS}="/dev/logi-mx-anywhere-3s"

SUBSYSTEM=="hid", ACTION=="bind", ENV{HID_UNIQ}=="yy:yy:yy:yy:yy:yy", ENV{HID_PHYS}=="xx:xx:xx:xx:xx:xx", TAG+="systemd", ENV{SYSTEMD_ALIAS}="/dev/logi-mx-anywhere-3s"

# sanity check
root# udevadm verify /etc/udev/rules.d/90-logi-mx-anywhere-button-switch.rules 
1 udev rules files have been checked.
  Success: 1
  Fail:    0

# Reload the daemon for our rule to be loaded
root# udevadm control -R
{% endhighlight %}

While udev rules can technically run programs with the `RUN` directive, the
documentation states that those are for very short lived programs. Testing
showed that trying to run ratbagctl from those RUN directives both slows down
the mouse becoming usable and fails. I suspect this is due to ratbagctl being
called before the mouse is fully "wired" on the system's side. We want the
mouse to be usable as quick as it's connected, no 10s limbo possible nor
desirable in a udev `RUN` either.

Solution: systemd and udev play nice with one another. Instead of running our
ratbagctl commands from the udev rule, we can run them from a systemd service
with a dependency on the `/dev/logi-mx-anywhere-3s` device as recommended in
the manpage:

{% highlight bash %}
# After reconnecting the mouse, check the expected systemd device was created
$ systemctl --user --all --full -t device | grep logi
  dev-logi\x2dmx\x2danywhere\x2d3s.device    loaded active plugged /dev/logi-mx-anywhere-3s

# Systemd path escape shenanigans
$ systemd-escape -p /dev/logi-mx-anywhere-3s
dev-logi\x2dmx\x2danywhere\x2d3s

$ cat ~/.config/systemd/user/logi-mx-anywhere-3s-swap-buttons.service 
[Unit]
Description=Swap buttons for copy/pasting on Logi MX Anywhere 3S
BindsTo=dev-logi\x2dmx\x2danywhere\x2d3s.device
After=dev-logi\x2dmx\x2danywhere\x2d3s.device

[Service]
Type=oneshot
ExecStart=ratbagctl thundering-gerbil button 2 action set special ratchet-mode-switch
ExecStart=ratbagctl thundering-gerbil button 5 action set button 3

[Install]
WantedBy=dev-logi\x2dmx\x2danywhere\x2d3s.device

$ systemctl --user enable logi-mx-anywhere-3s-swap-buttons.service
$ systemctl --user daemon-reload
{% endhighlight %}

Disconnect/reconnect the mouse a final time and enjoy the swapped buttons
without to ever have to think about it again! Muscle memory and workflow
intact, yay!
