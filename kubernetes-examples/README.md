# Kubernetes Examples

See individual directories for specific examples. Want to expand on these examples or add your own for a specific database? Pull requests welcome!

__Important!__ All the examples are tested with the Kubernetes distribution included in Docker Desktop (on Win 10 with WSL2 integration).

You can use Minikube too (https://kubernetes.io/docs/setup/learning-environment/minikube/) for local develpment on Windows/Mac/Linux.

## Important note about data 

The examples don't care about data storage, so if you want your data to be non-volatile it's up to you ;-)

## Namespace note

The deployments first create a "sqlpad" namespace, in which all resources are created.

So the '-n sqlpad' parameter must be added to all kubectl commands.

## Running from command line

```sh
# Rollout SQLPad deployment on Kubernetes cluster ( all resources are created in sqlpad namespace )
kubectl apply -f sqlpad-deployment.yml

# Get SQLPad port
The examples deploy a NodePort service, so you have to check for the port it is mapped to:

kubectl get svc -n sqlpad

Use the second port you find in the output to access SQLPad, for instance:

NAME         TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
sqlpad-svc   NodePort   10.111.227.230   <none>        3000:30779/TCP   64m

Type in browser -> http://localhost:30779

# Destroy all resources
kubectl delete ns sqlpad
```
