#!/bin/bash

REPO_DIR=`git rev-parse --show-toplevel`

promptContinue() {
	printf "Would like to continue? (Y/N) "

	read continue

	repliedY=`echo "$continue" | grep -iE "^(y|yes)$" 2> /dev/null`
	repliedN=`echo "$continue" | grep -iE "^(n|no)$" 2> /dev/null`

	if [ -n "$repliedY" ] ; then
		echo "Continuing..."
	elif [ -n "$repliedN" ] ; then
		echo "Deployment canceled"
		exit 0
	else
		echo "Response unclear"
		promptContinue
	fi
}

echo "D E P L O Y   S P A R K   W E B S I T E"
echo "This will upload your local files to the webserver, overwriting all existing content."

promptContinue

echo "Uploading files to webserver..."
scp -rp "$REPO_DIR/build" "$REPO_DIR/assets" ksf7@vergil.u.washington.edu:./public_html/
#scp -rp "$REPO_DIR/assets" ksf7@vergil.u.washington.edu:./public_html/assets

echo "Upload complete"
exit 1
