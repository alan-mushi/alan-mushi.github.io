---
layout: asap-post
title:  "Longhorn for K3S on Fedora cloud 38"
date:   2023-08-15
category: asap
---

It's [RedHat CTF infrastructure]({{ site.url }}/2022/12/12/redhat-ctf.html) time of year again. For a challenge I needed several pods sharing a volume. A `hostPath` volume would work if I only had _one_ node but I have 3; some networked volume is required. Luckily, [K3S supports Longhorn](https://docs.k3s.io/storage#whats-different-about-k3s-storage), a distributed block storage system.

Setting Longhorn up is straightforward... if it weren't for the missing bits. Symptoms include the storage class not showing up, the Longhorn UI appearing degraded, and the Longhorn manager pods loop-crashing. All of those is due to missing software on Fedora cloud 38.

Here is what needs to be done on the K3S nodes:

1. Install `iscsi-initiator-utils`
2. Start and Enable `iscsid.service`
3. Install `nfs-utils` (or you won't be able to mount a volume hosted on a different node)

Finally connect to the Longhorn UI (and create a test PersistentVolumeClaim+Pod volumeMount, cf. K3S Longhorn docs):

{% highlight text %}
$ kubectl --namespace longhorn-system port-forward --address 0.0.0.0 service/longhorn-frontend 5080:80
{% endhighlight %}
