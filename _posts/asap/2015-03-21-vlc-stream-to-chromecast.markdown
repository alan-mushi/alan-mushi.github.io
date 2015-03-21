---
layout: asap-post
title:  "vlc stream to chromecast"
date:   2015-03-21
category: asap
---

So, [vlc can now stream to chromecast](https://github.com/videolan/vlc/blob/master/NEWS#L72).

To compile this stream you must enable the configure option:

{% highlight bash %}
$ ./configure
	...
	--enable-chromecast
	...
{% endhighlight %}

The vlc command line options for the chromecast stream:

{% highlight bash %}
 Chromecast stream output (stream_out_chromecast)
      --sout-chromecast-ip <string> 
                                 This sets the IP adress of the Chromecast
                                 receiver.
          This sets the IP adress of the Chromecast receiver.
      --sout-chromecast-http-port <integer [-2147483648 .. 2147483647]> 
                                 This sets the HTTP port of the server used to
                                 stream the media to the Chromecast.
          This sets the HTTP port of the server used to stream the media to the
          Chromecast.
      --sout-chromecast-mux <string> 
                                 This sets the muxer used to stream to the
                                 Chromecast.
          This sets the muxer used to stream to the Chromecast.
      --sout-chromecast-mime <string> 
                                 This sets the media MIME content type sent to
                                 the Chromecast.
          This sets the media MIME content type sent to the Chromecast.
{% endhighlight %}

All there is left is to run vlc:

{% highlight bash %}
$ vlc -vvv ./file.mp4 --sout "#chromecast{ip=192.168.1.XX,mux=mp4}"
{% endhighlight %}

The `mux` option isn't mandatory but allowed me to stream pass vlc printing errors regarding the file format.

Due to my very bad wireless hotspot positioning, the overall experience isn't great (the signal goes like this: vlc <-> router <-> chromecast). This caused extensively long buffering and essentially, when a frame was buffered chromecast needed to load a newer one.
