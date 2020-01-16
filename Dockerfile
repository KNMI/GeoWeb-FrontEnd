FROM nginx
COPY dist /usr/share/nginx/html

COPY docker/nginx.conf /etc/nginx/nginx.conf

# Set the command to start the node server.
CMD echo "{ \
  \"BACKEND_SERVER_URL\": \"${GEOWEBBACKENDURL}\", \
  \"BACKEND_SERVER_XML2JSON\": \"${XML2JSONPROXY}\" \
}" > usr/share/nginx/html/urls.json \
  && nginx -g 'daemon off;'
