---
layout: asap-post
title:  "Usable OpenSSL symmetric encryption in Thunar"
date:   2016-02-09
category: asap
---

I like using console-based tools but my (non tech savvy) family not so much. Yet we need to exchange some files that we would like to keep confidential (or at the very least not in plaintext for Google to parse). Thus the usual workflow is for me to send them shell commands to encrypt/decrypt files. A better, simpler solution was needed and it came in the form of a script showing up in the contextual menu of Thunar (a file manager). Mostly I got the idea from [this repository](https://github.com/cytopia/thunar-custom-actions), except I didn't want GPG but plain symmetric encryption using OpenSSL. So here is the script, it uses unity to be user-friendly:

{% gist alan-mushi/8f7ead89fc9ce12b685c %}

Note that I chose to include only one cipher algorithm but there is place for others, in fact you can let a "crypto-aware" user choose among all the ciphers:

{% highlight bash %}
chooseOptions () {
	algorithms=$(openssl enc --help \
		|& grep -A 200 'Cipher Types' \
		| grep '^-' \
		| xargs \
		| sed -e 's/^-//' -e 's/ -/|/g')

	CMD="zenity --forms \
		--title=\"Encryption/Decryption with OpenSSL\" \
		--separator=\"|\" \
		--add-combo=\"Action\" \
		--combo-values=\"Encrypt|Decrypt\" \
		--add-combo=\"Algorithm\" \
		--combo-values=\"${algorithms}\" \
		--add-password=\"key\""

	eval "${CMD}"
}
{% endhighlight %}

Thunar extensions are simple to install. Open Thunar, Edit > Configure custom actions... > (+) Add a new custom action. In the "Basic" tab pick a name and the command (_i.e._ the path to your script: `/path/to/script.sh -f %f`), you might also want to take a nice lock icon. In the second tab, "Appearance Conditions" check everything but "Directories". All you need to do now is to open the contextual menu on a file (right click) and select the custom action:

![Contextual menu](/assets/contextual_menu.png)

And finally the dialog window:

![Zenity dialog](/assets/dialog.png)

> Note: big files can take quite a bit of time to encrypt/decrypt and there isn't a progress bar, as even the `-debug` argument for openssl don't directly expose a percentage but meerly read and writes calls.
