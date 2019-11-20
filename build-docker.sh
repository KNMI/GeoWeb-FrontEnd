#/bin/sh

docker build -t geoweb-frontend -f Dockerfile.nodebuild .

# You can now do 
# docker run -it -p 10000:80 -e GEOWEBBACKENDURL=https://geoweb.knmi.nl/backend -e BACKEND_SERVER_XML2JSON=https://geoweb.knmi.nl/backend/XML2JSON geoweb-frontend 