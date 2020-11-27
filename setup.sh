countdown() {
  for i in {10..1}
  do
    echo $i
    sleep 1
  done
}


echo 'Please provide your domain name, including http://'
read domain
echo "export const environment = {production: true, API_URL: '$domain:12345'};" > web/src/environments/environment.prod.ts
echo "Contents of environment.prod.ts are:"
cat web/src/environments/environment.prod.ts
echo "If this is wrong, please abort this script and try again. Otherwise, the Docker image will start building in 10 seconds"
countdown
echo "Starting Docker build"
docker-compose up -d