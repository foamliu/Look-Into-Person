@echo off
setlocal EnableDelayedExpansion
(set \n=^
%=Do not remove this line=%
)

set /p domain="Please provide your domain name, including http://!\n!"
@echo off
echo export const environment = {production: true, API_URL: '!domain!:12345'}; > web/src/environments/environment.prod.ts
echo Contents of environment.prod.ts are:
cat web\src\environments\environment.prod.ts
echo If this is wrong, please abort this script and try again.
pause 10
echo "Starting Docker build"
docker-compose up -d

