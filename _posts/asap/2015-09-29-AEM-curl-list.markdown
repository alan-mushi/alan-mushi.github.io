---
layout: asap-post
title:  "AEM 6 curl list"
date:   2015-09-29
category: asap
---

This is simply a list of bash/curl commands I used for [AEM version 6 for Docker](https://github.com/alan-mushi/AEM-for-Docker).
Everything is not in here, only commands I needed.
See the last point of this post for more on how to make non listed curl commands.

Adjust the `CQ_PORT` variable to 4503 or 4502 for publish and author respectively.
`$CURL` is set to the value `curl --retry ${CURL_RETRY_NUM} -s -# -u admin:${AEM_ADMIN_PASSWORD}`.
`CURL_RETRY_NUM` is advised for upload and installation mostly.
I assume that AEM is running on localhost in the following.

#AEM common commands

Installation of packages/bundles:

{% highlight bash %}
pkg=package.zip
pkg_path=/path/to/package/on/AEM/package.zip

# upload, this might fail if AEM is not "ready" yet
$CURL -F package=@${pkg} http://localhost:${CQ_PORT}/crx/packmgr/service/.json/?cmd=upload

# installation, again, this might fail for the same reasons as upload
$CURL -X POST http://localhost:${CQ_PORT}/crx/packmgr/service/.json${pkg_path}?cmd=install
{% endhighlight %}

Change the admin password:

{% highlight bash %}
new_password=best_password_ever
current_password=admin

$CURL \
	--data-urlencode rep:password="${new_password}" \
	--data-urlencode :currentPassword="${current_password}" \
	--data-urlencode _charset="utf-8" \
	http://localhost:${CQ_PORT}/home/users/a/admin.rw.userprops.html
{% endhighlight %}

#AEM Publish

AEM Publish installation guide recommend at least two options to be deactivated:

{% highlight bash %}
$CURL http://localhost:${CQ_PORT}/system/console/bundles/org.apache.sling.jcr.webdav -F action=stop
$CURL http://localhost:${CQ_PORT}/system/console/bundles/org.apache.sling.jcr.davex -F action=stop
{% endhighlight %}

Change rights to paths for the user, you can specify only the paths you wish to change:

{% highlight bash %}
user=anonymous

$CURL -X POST \
	--data-urlencode "authorizableId=${user}" \
	--data-urlencode "changelog=path:/,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/apps,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/content,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/etc,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/home,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/libs,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/oak:index,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/system,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/tmp,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	--data-urlencode "changelog=path:/var,read:true,modify:false,create:false,delete:false,acl_read:false,acl_edit:false,replicate:false" \
	http://localhost:${CQ_PORT}/.cqactions.htm
{% endhighlight %}

#AEM Author

Activation of a "path tree":

{% highlight bash %}
path=/path/to/something/

$CURL -X POST \
	--data-urlencode "path=${path}" \
	--data-urlencode "cmd=activate" \
	http://localhost:${CQ_PORT}/etc/replication/treeactivation.html
{% endhighlight %}

Configuration of webservices:

{% highlight bash %}
webservices_host="webservices"
webservices_port=1234
publish_admin_password="best_password_ever"

# creation of the files containing host/port
conf_webservices_file=$(mktemp /tmp/conf_webservices.XXXXXXXXXX)
cat << __EOF__ > $conf_webservices_file
--crxde
Content-Disposition: form-data; name=":diff"
Content-Type: text/plain; charset=utf-8

^/apps/WEBSITE/config/com.website.config.WSConfiguration/webservices.baseurl : "${webservices_host}"
^/apps/WEBSITE/config/com.website.config.WSConfiguration/webservices.port : "${webservices_port}"
--crxde--
__EOF__

# the file must be encoded in dos
unix2dos $conf_webservices_file

# upload of the "configuration file", note the --data-binary flag here!
$CURL -X POST \
	--header "Content-Type: multipart/form-data; charset=UTF-8; boundary=crxde" \
	--header "Referer: http://localhost:${CQ_PORT}/crx/de/index.jsp" \
	--data-binary @${conf_webservices_file} \
	http://localhost:${CQ_PORT}/crx/server/crx.default/jcr%3aroot

# finally, replicate the configuration
curl -u admin:${publish_admin_password} -v -s -X POST \
	--data-urlencode "path=/apps/WEBSITE/config/com.website.config.WSConfiguration" \
	--data-urlencode "action=replicate" \
	--data-urlencode "_charset_=utf-8" \
	http://localhost:${CQ_PORT}/crx/de/replication.jsp
{% endhighlight %}

Set the default home page:

{% highlight bash %}
# creation of the "configuration file"
conf_accueil_file=$(mktemp /tmp/conf_accueil.XXXXXXXXXX)
cat << __EOF__ > $conf_accueil_file
--crxde
Content-Disposition: form-data; name=":diff"
Content-Type: text/plain; charset=utf-8

^/content/sling:target : "/fr/accueil"
--crxde--
__EOF__

# same remarks as above
unix2dos $conf_accueil_file

# upload of the "configuration file"
$CURL -X POST \
	--header "Content-Type: multipart/form-data; charset=UTF-8; boundary=crxde" \
	--header "Referer: http://localhost:${CQ_PORT}/crx/de/index.jsp" \
	--data-binary @${conf_accueil_file} \
	http://localhost:${CQ_PORT}/crx/server/crx.default/jcr%3aroot

# finally, replicate the configuration
$CURL -X POST \
	--data-urlencode "path=/content" \
	--data-urlencode "action=replicate" \
	--data-urlencode "_charset_=utf-8" \
	http://localhost:${CQ_PORT}/crx/de/replication.jsp
{% endhighlight %}

Flush agents and replication agents are very close (only a few details differ).
A flush & replication agent's names is _only_ alphanum chars.

##Flush agent

Creation of the agent:

{% highlight bash %}
flush_title="Dispatcher Flush F1"
flush_name="flush1"

$CURL -X POST \
	--data-urlencode "cmd=createPage" \
	--data-urlencode "_charset_=utf-8" \
	--data-urlencode ":status=browser" \
	--data-urlencode "parentPath=/etc/replication/agents.author" \
	--data-urlencode "title=${flush_title}" \
	--data-urlencode "label=${flush_name}" \
	--data-urlencode "template=/libs/cq/replication/templates/agent" \
	http://localhost:${CQ_PORT}/bin/wcmcommand
{% endhighlight %}

Configuration of the agent, you can specify everything in one command:

{% highlight bash %}
flush_title="Dispatcher Flush 1"
flush_name="flush1"
flush_front_fqdn="192.168.1.10"
flush_front_port=123

$CURL -X POST \
	--data-urlencode "./sling:resourceType=cq/replication/components/agent" \
	--data-urlencode "./jcr:lastModified=" \
	--data-urlencode "./jcr:lastModifiedBy=" \
	--data-urlencode "_charset_=utf-8" \
	--data-urlencode ":status=browser" \
	--data-urlencode "./jcr:title=${flush_title}" \
	--data-urlencode "./jcr:description=Agent that sends flush requests to the dispatcher." \
	--data-urlencode "./enabled=true" \
	--data-urlencode "./enabled@Delete=" \
	--data-urlencode "./serializationType=flush" \
	--data-urlencode "./retryDelay=60000" \
	--data-urlencode "./userId=" \
	--data-urlencode "./logLevel=error" \
	--data-urlencode "./reverseReplication@Delete=" \
	--data-urlencode "./transportUri=http://${flush_front_fqdn}:${flush_front_port}/dispatcher/invalidate.cache" \
	--data-urlencode "./transportUser=" \
	--data-urlencode "./transportPassword=" \
	--data-urlencode "./transportNTLMDomain=" \
	--data-urlencode "./transportNTLMHost=" \
	--data-urlencode "./ssl=" \
	--data-urlencode "./protocolHTTPExpired@Delete=" \
	--data-urlencode "./proxyHost=" \
	--data-urlencode "./proxyPort=" \
	--data-urlencode "./proxyUser=" \
	--data-urlencode "./proxyPassword=" \
	--data-urlencode "./proxyNTLMDomain=" \
	--data-urlencode "./proxyNTLMHost=" \
	--data-urlencode "./protocolInterface=" \
	--data-urlencode "./protocolHTTPMethod=" \
	--data-urlencode "./protocolHTTPHeaders@Delete=" \
	--data-urlencode "./protocolHTTPConnectionClose@Delete=true" \
	--data-urlencode "./protocolConnectTimeout=" \
	--data-urlencode "./protocolSocketTimeout=" \
	--data-urlencode "./protocolVersion=" \
	--data-urlencode "./triggerSpecific@Delete=" \
	--data-urlencode "./triggerModified@Delete=" \
	--data-urlencode "./triggerDistribute@Delete=" \
	--data-urlencode "./triggerOnOffTime@Delete=" \
	--data-urlencode "./triggerReceive@Delete=" \
	--data-urlencode "./noStatusUpdate@Delete=" \
	--data-urlencode "./noVersioning@Delete=" \
	--data-urlencode "./queueBatchMode@Delete=" \
	--data-urlencode "./queueBatchWaitTime=" \
	--data-urlencode "./queueBatchMaxSize=" \
	http://localhost:${CQ_PORT}/etc/replication/agents.author/${flush_name}/jcr:content
{% endhighlight %}

Finally you can test the connexion:

{% highlight bash %}
$CURL http://localhost:${CQ_PORT}/etc/replication/agents.author/${flush_name}.test.html
{% endhighlight %}

#Replication Agent

The same curl command is used to create the replication and flush agent.

Configuration of the agent:

{% highlight bash %}
agent_title="Agent Publish 1"
agent_name="repl1"
agent_url="http://${agent_host}:${agent_port}/bin/receive?sling:authRequestLogin=1"
agent_password="best_password_ever"
agent_user="admin"

$CURL -X POST \
	--data-urlencode "./sling:resourceType=cq/replication/components/agent" \
	--data-urlencode "./jcr:lastModified=" \
	--data-urlencode "./jcr:lastModifiedBy=" \
	--data-urlencode "_charset_=utf-8" \
	--data-urlencode ":status=browser" \
	--data-urlencode "./jcr:title=${agent_title}" \
	--data-urlencode "./jcr:description=" \
	--data-urlencode "./enabled=true" \
	--data-urlencode "./enabled@Delete=" \
	--data-urlencode "./serializationType=durbo" \
	--data-urlencode "./retryDelay=60000" \
	--data-urlencode "./userId=" \
	--data-urlencode "./logLevel=info" \
	--data-urlencode "./reverseReplication@Delete=" \
	--data-urlencode "./transportUri=${agent_url}" \
	--data-urlencode "./transportUser=${agent_user}" \
	--data-urlencode "./transportPassword=${agent_password}" \
	--data-urlencode "./transportNTLMDomain=" \
	--data-urlencode "./transportNTLMHost=" \
	--data-urlencode "./ssl=" \
	--data-urlencode "./protocolHTTPExpired@Delete=" \
	--data-urlencode "./proxyHost=" \
	--data-urlencode "./proxyPort=" \
	--data-urlencode "./proxyUser=" \
	--data-urlencode "./proxyPassword=" \
	--data-urlencode "./proxyNTLMDomain=" \
	--data-urlencode "./proxyNTLMHost=" \
	--data-urlencode "./protocolInterface=" \
	--data-urlencode "./protocolHTTPMethod=" \
	--data-urlencode "./protocolHTTPHeaders@Delete=" \
	--data-urlencode "./protocolHTTPConnectionClose@Delete=true" \
	--data-urlencode "./protocolConnectTimeout=" \
	--data-urlencode "./protocolSocketTimeout=" \
	--data-urlencode "./protocolVersion=" \
	--data-urlencode "./triggerSpecific@Delete=" \
	--data-urlencode "./triggerModified@Delete=" \
	--data-urlencode "./triggerDistribute@Delete=" \
	--data-urlencode "./triggerOnOffTime@Delete=" \
	--data-urlencode "./triggerReceive@Delete=" \
	--data-urlencode "./noStatusUpdate@Delete=" \
	--data-urlencode "./noVersioning@Delete=" \
	--data-urlencode "./queueBatchMode@Delete=" \
	--data-urlencode "./queueBatchWaitTime=" \
	--data-urlencode "./queueBatchMaxSize=" \
	http://localhost:${CQ_PORT}/etc/replication/agents.author/${agent_name}/jcr:content
{% endhighlight %}

To test the configuration you simply need to curl `agent_url`.

Disabling the default replication agent is a one off command:

{% highlight bash %}
$CURL -X POST \
	--data-urlencode "./sling:resourceType=cq/replication/components/agent" \
	--data-urlencode "./jcr:lastModified=" \
	--data-urlencode "./jcr:lastModifiedBy=" \
	--data-urlencode "_charset_=utf-8" \
	--data-urlencode ":status=browser" \
	--data-urlencode "./jcr:title=Agent Publish" \
	--data-urlencode "./jcr:description=Agent that replicates to the default publish instance." \
	--data-urlencode "./enabled@Delete=" \
	--data-urlencode "./serializationType=durbo" \
	--data-urlencode "./retryDelay=60000" \
	--data-urlencode "./userId=" \
	--data-urlencode "./logLevel=info" \
	--data-urlencode "./reverseReplication@Delete=" \
	--data-urlencode "./transportUri=http://publish:4503/bin/receive?sling:authRequestLogin=1" \
	--data-urlencode "./transportUser=admin" \
	--data-urlencode "./transportPassword={2fe3a1bc231e172fce538a46c4eec7153f48c4c4266191643a634e41dd1b2543}" \
	--data-urlencode "./transportNTLMDomain=" \
	--data-urlencode "./transportNTLMHost=" \
	--data-urlencode "./ssl=" \
	--data-urlencode "./protocolHTTPExpired@Delete=" \
	--data-urlencode "./proxyHost=" \
	--data-urlencode "./proxyPort=" \
	--data-urlencode "./proxyUser=" \
	--data-urlencode "./proxyPassword=" \
	--data-urlencode "./proxyNTLMDomain=" \
	--data-urlencode "./proxyNTLMHost=" \
	--data-urlencode "./protocolInterface=" \
	--data-urlencode "./protocolHTTPMethod=" \
	--data-urlencode "./protocolHTTPHeaders@Delete=" \
	--data-urlencode "./protocolHTTPConnectionClose@Delete=true" \
	--data-urlencode "./protocolConnectTimeout=" \
	--data-urlencode "./protocolSocketTimeout=" \
	--data-urlencode "./protocolVersion=" \
	--data-urlencode "./triggerSpecific@Delete=" \
	--data-urlencode "./triggerModified@Delete=" \
	--data-urlencode "./triggerDistribute@Delete=" \
	--data-urlencode "./triggerOnOffTime@Delete=" \
	--data-urlencode "./triggerReceive@Delete=" \
	--data-urlencode "./noStatusUpdate@Delete=" \
	--data-urlencode "./noVersioning@Delete=" \
	--data-urlencode "./queueBatchMode@Delete=" \
	--data-urlencode "./queueBatchWaitTime=" \
	--data-urlencode "./queueBatchMaxSize=" \
	http://localhost:${CQ_PORT}/etc/replication/agents.author/publish/jcr:content
{% endhighlight %}

#How to make new curl commands

The basic idea is to spy on what's being exchanged.
You can do this by using your browser (F12 then the network tab).
In some cases you might need wireshark, mostly to troubleshoot the curl command you are trying out (hint: check out character encoding).
As you can see from the above, there is two "patterns" for those curl commands.
One is basic but the other one requires building a "configuration file" and uploading it.
