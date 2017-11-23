#!/bin/bash

# Use this script to submit a release to the API

HOST=localhost
PORT=3000
PROTOCOL=http
VERBOSE=''
NOOP=false
APPLICATION_ID=
VERSION=1.0.0
ROLE=1
DEPLOY_AT=0

while getopts ":a:d:h:np:P:r:vV:" opt
do
  case $opt in
    a)
      APPLICATION_ID=$OPTARG
      ;;
    d)
      DEPLOY_AT=$OPTARG
      ;;
    h)
      HOST=$OPTARG
      ;;
    n)
      NOOP=true
      ;;
    p)
      PORT=$OPTARG
      ;;
    P)
      PROTOCOL=$OPTARG
      ;;
    r)
      ROLE=$OPTARG
      ;;
    v)
      VERBOSE="-v"
      ;;
    V)
      VERSION=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
  esac
done

shift $((OPTIND-1))

TARBALL=$1

if [ -z "$TARBALL" ]
then
  echo "Must specify a path to the tarball to deploy!" >&2
  exit 1
fi

if [ -z "$APPLICATION_ID" ]
then
  echo "Must specify an application id for deploy!" >&2
  exit 1
fi

if [ "$NOOP" == true ]
then
  echo "Parameters:"
  echo "  Protocol       = $PROTOCOL"
  echo "  Host           = $HOST"
  echo "  Port           = $PORT"
  echo "  Verbose        = $VERBOSE"
  echo "  APPLICATION_ID = $APPLICATION_ID"
  echo "  VERSION        = $VERSION"
  echo "  ROLE           = $ROLE"
  echo "  DEPLOY_AT      = $DEPLOY_AT"
  echo "  TARBALL        = $TARBALL"
else
  curl $VERBOSE \
    -F "tarball=@${TARBALL}" \
    -F "application_id=$APPLICATION_ID" \
    -F "version=$VERSION" \
    -F "role=$ROLE" \
    -F "deploy_at=$DEPLOY_AT" \
    ${PROTOCOL}://${HOST}:${PORT}/deploys
fi
