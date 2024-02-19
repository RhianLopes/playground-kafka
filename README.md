# Playground Kafka

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Helm](https://helm.sh/docs/intro/install/)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Node](https://nodejs.org/en/download/current)

## Install Rancher with Docker

```shell
docker run --name rancher -d --restart=unless-stopped -p 80:80 -p 443:443 --privileged rancher/rancher:v2.7.9
```

- Rancher: http://localhost:80/

Run this command to get the boostrap password

```shell
docker logs rancher 2>&1 | grep "Bootstrap Password:"
```

After this cofigure your password and access the `local` cluster

In the top right corner of the website copy your `.kube/config` and edit your local conf

```shell
code ~/.kube/config
```

## Install local path storage for rancher with Kubectl

```shell
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.26/deploy/local-path-storage.yaml
```

```shell
kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

> Ref https://github.com/rancher/local-path-provisioner

## Install kafka with Helm

```shell
helm install kafka bitnami/kafka --version 26.6.2 --namespace kafka --create-namespace
```

## Install kafka-ui with Helm

```shell
kubectl get secret kafka-user-passwords --namespace kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1
```

Get the client password from kafka and use in <client_secret>:

```shell
helm install kafka-ui kafka-ui/kafka-ui --version 0.7.5 \
    --set envs.config.KAFKA_CLUSTERS_0_NAME=local \
    --set envs.config.KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS="kafka-controller-0.kafka-controller-headless.kafka.svc.cluster.local:9092\,kafka-controller-1.kafka-controller-headless.kafka.svc.cluster.local:9092\,kafka-controller-2.kafka-controller-headless.kafka.svc.cluster.local:9092" \
    --set envs.config.KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL=SASL_PLAINTEXT \
    --set envs.config.KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM=PLAIN \
    --set envs.config.KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG='org.apache.kafka.common.security.plain.PlainLoginModule required username="user1" password="<client_secret>";' \
    --namespace kafka-ui --create-namespace
```

```shell
kubectl -n kafka-ui port-forward svc/kafka-ui 8080:80
```

- Kafka UI: http://localhost:8080/

Access and create a `example-topic` for test

## Build and run locally kafka-consumer-app with Docker

```shell
cd kafka-consumer
```

```shell
docker build -t rhianlopes/kafka-consumer:latest .
```

```shell
docker push rhianlopes/kafka-consumer:latest
```

> Optional command to running app locally: docker run -p 3000:3000 -d rhianlopes/kafka-consumer:latest

## Deploy Consumer with Helm


```shell
cd ..
```

Edit `helm-charts/consumer/values.yaml` with <client_secret> value in `KAFKA_SECRET`

```shell
helm upgrade --install kafka-consumer helm-charts/consumer -f helm-charts/consumer/values.yaml --namespace dev-kafka-consumer --create-namespace
```

## Install KEDA

```shell
helm repo add kedacore https://kedacore.github.io/charts
```

```shell
helm repo update
```

```shell
helm install keda kedacore/keda --version 2.12 --namespace keda --create-namespace
```

## Deploy Consumer KEDA with Helm

```shell
helm upgrade --install kafka-consumer helm-charts/consumer-keda -f helm-charts/consumer-keda/values.yaml --namespace dev-kafka-consumer --create-namespace
```
