#/bin/sh

docker build -t geoweb-frontend -f Dockerfile.nodebuild .

# You can now do docker run -it -p 10000:80 geoweb-frontend