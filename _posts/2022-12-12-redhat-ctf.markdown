---
layout: post
title:  "Red Hat CTF 2022"
date:   2022-12-12
---

Last year, Red Hat Product Security organization celebrated its 20th birthday, for that occasion, my team created a CTF for Red Hat employees. It turned out to be a pretty nice event with players showing interest in participating again, so we did a new edition. This year's CTF was hosted during the "We Are Red Hat Week" with infrastructure/challenges created by Janos Bonic, Oleg Sushchenko, and myself with help from other parts of the company for the non-technical aspects of it all.

Besides the obvious argument of the CTF being a nice platform to encourage engineer's security awareness through gamification, creating challenges and dealing with the infrastructure turned out to be pretty interesting. I took the opportunity of having little constraints to deviate from typical CTF challenges a bit and dabble in tech/techniques I needed some excuse to play with: Double SQL prepare injections, eBPF tc filter, WebAssembly, &cie. `<ramblings>` We had a pretty technically diverse audience for this CTF, most of whom had never participated in such an event before, and some were at loss with how to proceed. Challenges should perhaps be accompanied by a more educational track, so all levels can benefit and have fun. `</ramblings>`

Some players made writeups for most of the challenges and/or showcased their solutions in the closing event, thanks to them! If you're curious of some of the challenges, here is a list of public writeups:

- [Parachute](https://gist.github.com/infinitewarp/5b8d9e0a70ff5fa51eab0762a671c6ec)
- [Horace's Payload](https://github.com/bengal/misc/blob/main/ctf/rh2022/horace-payload.md)
- [Johannes' coffee cup](https://github.com/r00ta/myWriteUps/tree/master/RH_CTF_2022/johannes_coffe_rev/README.md), [Johannes' coffee cup, alt.](https://gitlab.com/teuf/rh-ctf-notes/-/blob/main/johannes-coffee.md)
- [Edisson Space's capsule](https://gitlab.com/michaelho_redhat/rh-ctf-writeups/-/blob/main/edison-spaces-capsule.md)

The infrastructure running the challenges was pretty different from last year's infrastructure (Kubernetes + external HaProxy) and hinges purely on [k3s](https://k3s.io/). In retrospect this is the obvious choice: k3s is light to run and has all we needed, Traefik for ingress controller and Klipper for a service load balancer (we had 3 nodes running).

The goodness of having Traefik bundled-in is made a bit annoying by the slightly different configurations for versions as reflected by the mess of StackOverflow responses and Traefik reference docs' organization. So here's a recap of the info I needed for all things Traefik on k3s version [v1.24.4](https://github.com/k3s-io/k3s/releases/tag/v1.24.4+k3s1#Embedded%20Component%20Versions):

1. Defining an UDP entrypoint. Edit helm's manifest for Traefik's configuration on the master node `/var/lib/rancher/k3s/server/manifests/traefik-config.yaml`, here the entrypoint is called `udpep`:

{% highlight yaml %}
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
	additionalArguments:
	- "--entryPoints.udpep.address=:9999/udp"
	- "--entrypoints.udpep.udp.timeout=1"
	- "--accesslog=true"
	entryPoints:
  	  udpep:
        address: ':9999/udp'
{% endhighlight %}

2. Define a custom TLS certificate to be used for all Traefik https endpoints by creating the following Kubernetes objects, the `namespace=default/name=default` for the TLSStore is what Traefik looks for:

{% highlight yaml %}
apiVersion: v1
kind: Secret
metadata:
  name: override-traefik-default-tls-cert
  namespace: default
data:
  tls.crt: LS0tL[...]
  tls.key: LS0tL[...]
---
apiVersion: traefik.containo.us/v1alpha1
kind: TLSStore
metadata:
  name: default
  namespace: default
spec:
  defaultCertificate:
	secretName: override-traefik-default-tls-cert
{% endhighlight %}

3. Full example for a HTTP-Basic password protected Traefik https endpoint, with 3 replicas round-robin load balanced:

{% highlight yaml %}
---
apiVersion: v1
kind: Namespace
metadata:
  name: challenge-web-graphql
  labels:
    challenge: web-graphql
---
apiVersion: v1
kind: Service
metadata:
  name: challenge-web-graphql
  namespace: challenge-web-graphql
  labels:
    challenge: web-graphql
spec:
  selector:
    challenge: web-graphql
  ports:
    - protocol: TCP
      port: 5000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: challenge-web-graphql
  namespace: challenge-web-graphql
  labels:
    challenge: web-graphql
spec:
  replicas: 3
  selector:
    matchLabels:
      challenge: web-graphql
  template:
    metadata:
      labels:
        challenge: web-graphql
    spec:
      containers:
        - name: web-graphql
          image: [...]
          ports:
            - containerPort: 5000
---
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: temporary-auth
  namespace: challenge-web-graphql
spec:
  basicAuth:
    secret: temporary-auth-userssecret
---
apiVersion: v1
kind: Secret
metadata:
  name: temporary-auth-userssecret
  namespace: challenge-web-graphql
type: kubernetes.io/basic-auth
data:
  username: dXNlcg== # username: user
  password: T3V3b2gzZWV3YWU3ZWVsYWhzaGl1eGFlNGllUGg2 # password: Ouwoh3eewae7eelahshiuxae4iePh6
---
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: challenge-web-graphql
  namespace: challenge-web-graphql
  annotations:
    traefik.ingress.kubernetes.io/router.tls: "true"
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.middlewares: challenge-web-graphql-temporary-auth@kubernetescrd
spec:
  rules:
    - host: some.host.name
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: challenge-web-graphql
                port:
                  number: 5000
{% endhighlight %}
