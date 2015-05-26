---
layout: post
title:  "[ncurses] Making a simple ncurses popup in C"
date:   2015-05-26
tags:	demo ncurses
---

> The ncurses library in C is focused on "low-level" functionalities, if you need a higher level of abstraction check out [CDK](http://www.tldp.org/HOWTO/NCURSES-Programming-HOWTO/tools.html#CDK).

For the popup demo I took model on some "authentication" that consist of 2 modifiable fields (id & password) with the 2 associated labels and 2 buttons at the bottom. The window dispositions schema is at the beginning of the source file. `win_menu` contains the buttons and `win_form` the fields/labels. A simple boolean is used to know in which window the cursor is. The popup looks like this :

![ncurses popup](/assets/ncurses-simple-popup.png)

And here is the source code :

{% gist alan-mushi/375a569833f67724322b ncurses-simple-pop-up.c %}

There is only two interesting functions (beside popup creation/destruction) :

* `driver_buttons()` is triggered when a button is pressed, it's most likely what you want to modify to re-use this example.
* `driver()` is tedious but stright-forward, it also does some actions to ease the use. For example if the cursor is on the last field and you press the "down arrow" the cursor will switch to the buttons.

> **Warning**: if the length of your form (label + field) is greater than the length of `win_form`, `post_form()` will fail. You can make your popup dynamic in size by re-sizing at runtime your windows according to the length of the form, this is however a bit hack-ish (implementation example [here](https://github.com/eurogiciel-oss/connman-json-client/blob/3c0c9daac676358c5d47d2db78a5dbb65bc276fb/popup.c#L159-170)).

This example is very basic and in many cases you will need a more generic popup, you can find an improved version [here](https://gist.github.com/alan-mushi/8df30ee3af1c93348fa4).
