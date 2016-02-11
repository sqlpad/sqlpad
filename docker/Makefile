NODEJS_VERSION?=4.3.0
SQLPAD_VERSION?=1.15.0
DOCKER_NAME=sqlpad/sqlpad

all: template build version push clean

template:
	cp Dockerfile.tpl Dockerfile
	sed -i -e 's/__NODEJS_VERSION__/$(NODEJS_VERSION)/' Dockerfile
	sed -i -e 's/__SQLPAD_VERSION__/$(SQLPAD_VERSION)/' Dockerfile

build:
	docker build -t $(DOCKER_NAME):latest .

version:
	docker tag -f $(DOCKER_NAME):latest $(DOCKER_NAME):$(SQLPAD_VERSION)

push:
	docker push $(DOCKER_NAME):latest
	docker push $(DOCKER_NAME):$(SQLPAD_VERSION)

clean:
	rm -f Dockerfile
