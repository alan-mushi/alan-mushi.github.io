---
layout: asap-post
title:  "Kubernetes Jobs quota"
date:   2023-11-27
category: asap
---

For the RedHat internal CTF we needed people to have fun with Remote Code Execution without impacting other players. The challenges' story (AWS config `credential_process` configuration directive and [git `fsmonitor`](https://www.sonarsource.com/blog/securing-developer-tools-git-integrations/)) and frontend was made to hint at async processing, so easy right, just spawn a job/pod!

Except we don't have that big of a kubernetes cluster, nor do we need one, so we have to put limits on concurrent number of executing jobs/pods in place. The [standard StackOverflow answer](https://stackoverflow.com/a/71069007) is to create a quota on the number of concurrent running _pods_ (in a namespace). This turned out to be wildly unpractical: we can't easily tell if our quota was reached or if something bad happened with the job/pod execution. Checking out the kubernetes doc gives us a better answer: [`count/<resource>.<group>`](https://kubernetes.io/docs/concepts/policy/resource-quotas/#object-count-quota).

`count/jobs.batch` is what we need here. Setting the limit on the number of jobs instead on the number of pods gives us a somewhat generic error code when we try to spawn one concurrent job too many:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: limit-jobs-number
spec:
  hard:
    count/jobs.batch: 30
```

In the job-spawning code, simply watch for errors from the kubernetes API.
