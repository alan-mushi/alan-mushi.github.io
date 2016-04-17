---
layout: post
title:  "[ncurses] black magic with forms"
date:   2014-11-30
tags:   demo ncurses
---
# Digressions
Ncurses is *black* magic, for real! You read the [magic book of spells](http://tldp.org/HOWTO/NCURSES-Programming-HOWTO/), you try copy paste of an example and you have a very basic, unsatisfactory test program. So you dive in the ressource only lost souls know as "manual pages". You do so hoping to improve/tweak your test program, so that it could actually do what it is you want to do. That's where things get harder. Man pages for the ncurses library are pretty good and thorough, but somehow your modifications makes the program reacting as... posessed (unexpected behaviours). Yeah you probably missed something, restart from the book of spells.

This process is kind of frustrating and ncurses could use some examples, here is one.

# Simple ncurses forms example
If you are reading this you might have encountered fields, HTML fields that is. You are most likely very used to navigate them, arrow keys, alphabetical keys, tabulation key (experts only)...

**Ncurses fields are not like those.** Yeah that would be too simple.

In this post I will present how to make a ncurses behave like the one you are accustomed to use.

I won't cover all the wonderful things you can do with forms in ncurses. If you want a complete showdown of all the possibilities checkout the `test/demo_form` example in the [archive](ftp://ftp.gnu.org/pub/gnu/ncurses/).

A little thing worth noting:

Imagine you are editing a field, you type in characters and at some point try to fetch the data of a field. Surprise, it won't work! Yes the characters you typed are printed in the field element but a little (hidden) thing called synchronisation is in the way. Indeed, you need to explicitly tell ncurses to copy what you typed in the field to the data attribute. To do this I use a hack-ish way: just leave and come back to the field. It's nasty I know, if you have a better way of doing things please let me know!

# Code

> You might need to adjust the headers for ncurses (e.g. `<ncurses/XXX.h>` -> `<XXX.h>`) this depends on your distribution. Moreover, with some versions of gcc the command line supplied for the compilation may cause (fatal) errors, so remove `-Werror` and all should be fine.

{% gist alan-mushi/c8a6f34d1df18574f643 fields_magic.c %}

Putting a blob of code like this may seem a bit harsh but do not fear the main(), it has many lines but all are easy to understand.

In this example I don't cover things like ctrl+left arrow to move the cursor one word before. I'm not even sure it's feasible : [another book of spells](https://www.gnu.org/software/guile-ncurses/manual/html_node/Getting-characters-from-the-keyboard.html).
