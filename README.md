# app-deployer
An application deployment environment.

The idea here is to provide an API server that allows an application developer
to do their thing while developing the application, then submit their work to
the API server to perform the tasks required to get the application deployed to
the appropriate server in their environment.

This is probably a bit of overkill for environments that have a single application 
and single server to deploy to. Where this thing will come in handy is when your
environment has multiple applications and/or multiple deployment targets. For example,
you might have an internal test server, a UAT server and - finally a production environment.
Or maybe you have single application/single deployment environment, but you have multiple
servers to deploy to (e.g. app server, worker server, etc).

## Infrastructure

OK, so what is this thing? There are multiple pieces/parts to it:

1. ExpressJs API Server: provides the necessary API delivery mechanism that allows end-users
   to interact with the system without required direct access to the server. The server 
   would normally be installed on a jump-server that has visibility to the systems you want
   to deploy to.
2. SQLLite3 database: provides the persistence mechanism to hold your environment's
   configuration and tracks the deployments you'll be making.
   
The ExpressJs server doesn't directly perform any deployment activities; it simply provides
the means to capture the intent of a deployment and to invoke the tool you want to use to
actually perform the deployment. For the initial development of this application the idea
is to use ansible as the actual deployment mechanism. All the server actually does is to
invoke whatever script, playbook, or whatever you've defined to perform the actual deployment
activity. That will be more clear as the development of this tool evolves.

That's enough for the moment. More documentation will be forthcoming.
