---
layout: post
title:  "[json-c] Tutorial part 4: Parsing"
date:   2014-10-28
tags:   tutorial json-c
---
Creating (writing lines for) new `json_objects` is *extremely* boring. Moreover, if you have to handle json as a string in input making your own parser isn't a bright idea.

#Introducing json-c parser

To parse a json string in json-c you have two methods. The first one is very easy to use but don't offer any options. The second one require some extra work to get the job done but support options.

I will only cover the first method because it's the only one I used. However, the second method isn't useless: It should be more efficient if you have to parse a lot of (or frequently) json strings. Those slight performance improvements comes from the implementation of the first method (roughly):

- create a `json_tokener`
- try to parse the json string
- delete the tokener

Back to the first method now. Two set of functions are available, here are the prototypes:

{% highlight C %}
struct json_object * json_tokener_parse(const char *str);

const char * json_tokener_error_desc(enum json_tokener_error jerr)
struct json_object * json_tokener_parse_verbose(const char *str, enum json_tokener_error *error);
{% endhighlight %}

The first function won't display any errors. If the parsing succeed you have the corresponding `json_object`, otherwise you get NULL.

The second set of functions allows you to get a reason on why the parsing failed, it might be of assistance in case of malformated json strings (on purpose? :smiling_imp:).

#Example

Pretty simple to use right ? So here is a short example:

{% gist alan-mushi/19546a0e2c6bd4e059fd json_parser.c %}

And the output:

{% highlight text %}
str:
---
{ "msg-type": [ "0xdeadbeef", "irc log" ], 		"msg-from": { "class": "soldier", "name": "Wixilav" }, 		"msg-to": { "class": "supreme-commander", "name": "[Redacted]" }, 		"msg-log": [ 			"soldier: Boss there is a slight problem with the piece offering to humans", 			"supreme-commander: Explain yourself soldier!", 			"soldier: Well they don't seem to move anymore...", 	"supreme-commander: Oh snap, I came here to see them twerk!" 			] 		}
---

jobj from str:
---
{
   "msg-type": [
     "0xdeadbeef",
     "irc log"
   ],
   "msg-from": {
     "class": "soldier",
     "name": "Wixilav"
   },
   "msg-to": {
     "class": "supreme-commander",
     "name": "[Redacted]"
   },
   "msg-log": [
     "soldier: Boss there is a slight problem with the piece offering to humans",
     "supreme-commander: Explain yourself soldier!",
     "soldier: Well they don't seem to move anymore...",
     "supreme-commander: Oh snap, I came here to see them twerk!"
   ]
 }
---
{% endhighlight %}

#The End

I hope you have all the explanations you need to get started with json-c, if not you can complain in the comments ;).

{% include prevnext.html paramPrev="2014/10/28/json-c-tutorial-part-3.html" paramOutline="2014/10/28/json-c-tutorial-intro-outline.html" %}