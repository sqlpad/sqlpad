DOCKER_NAME=sqlpad/sqlpad

all: build version push clean

build:
	docker build -t $(DOCKER_NAME):latest .

version:
	docker tag $(DOCKER_NAME):latest $(DOCKER_NAME):$(SQLPAD_VERSION)

push:
	docker push $(DOCKER_NAME):latest
	docker push $(DOCKER_NAME):$(SQLPAD_VERSION)
