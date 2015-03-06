#!/bin/bash

export METHOD="POST"

if [[ "$2" == "deregister" ]]; then
	export METHOD="DELETE"
fi

if [[ "$1" != "" ]]; then
	curl -vvv -X $METHOD -k -u ${INFORMATION_SERVICE_LOGIN}:${INFORMATION_SERVICE_PASSWORD} --data "address=$1" http://${INFORMATION_SERVICE_URL}/chart_services
fi
