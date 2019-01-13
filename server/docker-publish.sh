DOCKER_NAME=sqlpad/sqlpad
SQLPAD_VERSION=$(node -pe "require('./package.json').version")

docker build -t $DOCKER_NAME:latest .

docker tag $DOCKER_NAME:latest $DOCKER_NAME:$SQLPAD_VERSION

docker push $DOCKER_NAME:latest	
docker push $DOCKER_NAME:$SQLPAD_VERSION