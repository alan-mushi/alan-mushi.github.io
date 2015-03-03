---
layout: post
title:  "[Click Modular Router] Clicky export diagrams in SVG"
date:   2015-01-05
tags:	gtk2 tutorial
---
#Clicky, ClickRouter and SVG

ClickRouter is a modular router we are using/extending at school, I won't speak of it in depth in this post but you can [go here](https://github.com/kohler/click) for more details.

Clicky is an -old- piece of software that interfaces with ClickRouter and is written in C using GTK+2. I found Clicky to have two interesting features:

- Represent a `.click` (config files for ClickRouter) as a graph of elements
- Tells you when you did a poor job at chaining elements

The problem with the first feature is interesting as you `.click` file get more and more complex. Moreover it is possible to export the generated graph. This exportation was only available in PDF, making far from easy the insertion of the graph in another document (e.g. a report).

SVG is a xml format that describe geometrical shapes instead of saving the rendering of those shapes. This is a great advantage, in particular in the case of graphs, allowing infinite zoom (while keeping a perfect image definition) and modification.

> Little example of a SVG file representing a [Spidron](https://en.wikipedia.org/wiki/Spidron) (zoom in/out):
> ![SVG Spidron](/assets/Spidron.svg)

So I added, because I needed it, the SVG export via two pull requests:

- [export in svg/pdf according to the file extension](https://github.com/kohler/click/pull/158)
- [export format selection in a dialog](https://github.com/kohler/click/pull/161)

I did not wrote this to brag about it but I had a bit of trouble finding comprehensive documentation on how to make the second pull request's code.

#Making a drop down in GTK+2 to select the file extension

> Note: I'm not very knowledgeable in GTK+2, if you have a better way to do the following I would love to hear about it !

Expected result:
![Drop down file extension selection](/assets/screenshot-gtk2-dropdown.png)

This "drop down" is actually called "combo box text" and is a GtkWidget very close to "combo box". To use it you must :

1. Create the combo box text
2. Fill the combo box text
3. (Optional) Set a default value
4. Add the combo box text to an existing dialog window
5. Retrieve the selected entry after user interaction

Thus you have the following code:

{% highlight c %}
// No need to add includes, you should have <gtk/gtk.h> already!

// #1
GtkWidget *combo_extensions = gtk_combo_box_text_new();

// #2
gtk_combo_box_text_append_text(GTK_COMBO_BOX_TEXT(combo_extensions), "PDF");
gtk_combo_box_text_append_text(GTK_COMBO_BOX_TEXT(combo_extensions), "SVG");

// #3
gtk_combo_box_set_active(GTK_COMBO_BOX(combo_extensions), 0);

// #4
gtk_file_chooser_set_extra_widget(GTK_FILE_CHOOSER(dialog), combo_extensions);

// Some user interaction

// #5
int export_to_index = gtk_combo_box_get_active(GTK_COMBO_BOX(combo_extensions));
{% endhighlight %}

It worth noting that the third and the fifth steps use indexes in the combo box.
Thus, depending on the length of the drop down an array might be a good idea!

Well that's it! It's not complex but I couldn't find much practical examples...

> Note: This is meant for GTK+2 but I believe GTK+3 have quite similar functions.

You can then do some tweaks to adapt the size/disposition of this combo box, this is left as an exercice ;).
