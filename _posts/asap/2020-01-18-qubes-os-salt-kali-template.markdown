---
layout: asap-post
title:  "Qubes-os: Kali template using salt"
date:   2020-03-18
category: asap
---

[Qubes-os ships with salt](https://www.qubes-os.org/doc/salt/) to automate your qubes setup. It's a pretty handy to install programs and fancy configuration files but can also be used to bake your qubes templates with reproducibility.
The [documented installation process for Kali templates](https://www.qubes-os.org/doc/pentesting/kali/) is quite hands on, let's use salt to remedy that.

`/srv/salt/kali.top`:

{% highlight yaml %}
base:
  dom0:
    - kali-tmpl
    - kali
  
  'kali-tmpl':
    - kali-install
{% endhighlight %}

The `dom0` section sets up the qubes and `kali-tmpl` adds the repo and installs the meta-package in the template. Keep in mind `*.top` references the other files, any file names changes must be reflected in it.

`/srv/salt/kali-tmpl.sls`:

{% highlight yaml %}
clone:
  qvm.clone:
    - name: kali-tmpl
    - source: debian-10

prefs:
  qvm.prefs:
    - name: kali-tmpl
    - require:
      - clone
    - memory: 2048
    - vcpus: 2
    - netvm: sys-firewall
    - label: red

size:
  cmd.run:
    - require:
      - prefs
    - name: sudo qvm-volume extend kali-tmpl:root 50GiB
{% endhighlight %}

To my knowledge (and a few clumsy greps) there is no `qvm.volume` salt command to resize the volume so we do it manually. Resizing is needed, a full Kali installation is bigger than the default disk size of debian-10.

`/srv/salt/kali.sls`:

{% highlight yaml %}
kali:
  qvm.present:
    - name: kali
    - label: red
    - template: kali-tmpl
{% endhighlight %}

`/srv/salt/kali-install.sls`:

{% highlight yaml %}
python-apt:
  pkg.installed:
    - pkgs:
      - python-apt
      - apt-transport-https
      - ca-certificates
      - curl
      - gnupg2
      - software-properties-common

install:
  pkgrepo.managed:
    - humanname: Kali Linux Repo
    - name: deb http://http.kali.org/kali kali-rolling main non-free contrib
    - architectures: amd64
    - file: /etc/apt/sources.list.d/kali.list
    - gpgcheck: 1
    - key_url: https://www.kali.org/archive-key.asc
    - require:
      - pkg: python-apt
  cmd.run:
    - name: sudo apt update
    - name: sudo apt upgrade -y
    - name: sudo dpkg --configure -a
  pkg.latest:
    - name: kali-linux-full
    - refresh: True
{% endhighlight %}

Packages specified in `python-apt` are required for salt to manage/install/fetch/configure the new repository. Consult the documentation for the various key and repository configuration options [here](https://docs.saltstack.com/en/latest/ref/states/all/salt.states.pkgrepo.html). The one depicted here (downloading the key without checking it) is not optimal... but the key server just happened to be down, verifying it manually before installing packages did the trick.

Add `kali.top` to salt and kickoff the template creation:

{% highlight text %}
# qubesctl top.enable kali.top
# qubesctl --all state.highstate
{% endhighlight %}

`kali-linux-full` installation took forever (and not having stdout to make it go faster by starring at it is a bit frustrating, use `--show-output` for that). Once everything ran smoothly, we have our Kali template and assorted AppVM:

{% highlight text %}
# qvm-ls | grep kali
kali              Halted   AppVM         red     kali-tmpl      sys-firewall
kali-tmpl         Halted   TemplateVM    red     -              sys-firewall

# qvm-run -a --pass-io kali-tmpl 'apt-cache policy kali-linux-full'
kali-linux-full:
  Installed: 2020.1.18
  Candidate: 2020.1.18
  Version table:
 *** 2020.1.12 500
        500 http://http.kali.org/kali kali-rolling/main amd64 Packages
        100 /var/lib/dpkg/status
{% endhighlight %}
