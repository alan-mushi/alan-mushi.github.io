---
layout: asap-post
title:  "Importing K8S objects to Neo4j using only Cypher"
date:   2024-02-18
category: asap
---

Mostly for fun, because I got lost on Neo4j's docs for some reason, and also needed a quick graph visualisation+query of a complex OpenShift cluster, I tried to import K8s/OpenShift objects from the API to a Neo4j database. The goal was kind of to make a quick and dirty bloodhound for kubernetes, making a fully fledge replacement of [KubeHound](https://github.com/DataDog/KubeHound) or [IceKube](https://github.com/WithSecureLabs/IceKube) was not in the cards.

Thanks to the [`apoc.load.json`](https://neo4j.com/docs/apoc/current/import/load-json/#load-json-available-procedures-apoc.load.json) and [`apoc.cypher.runFiles`](https://neo4j.com/labs/apoc/4.4/overview/apoc.cypher/apoc.cypher.runFiles/) functions, we can easily load a JSON resource (file and URL with auth bits) and execute some script while passing arguments to it. With this we can do a loop structure to factorize the cypher queries to import objects in a particular namespace.

This came together pretty quick (given that I'd never played with Cypher before): [repo](https://github.com/alan-mushi/k8s-import-to-neo4j) The most "annoying" thing to deal with in the input data is the optional arrays, possibly nested, so when in doubt apply [this pattern](https://github.com/alan-mushi/k8s-import-to-neo4j/blob/3fe5dd2517de92719d6ef1d582a3520fb5c35368/import_queries/60_clusterrolebindings.cypher#L17-L20).
