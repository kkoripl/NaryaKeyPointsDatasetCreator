## Installing dependencies
Move into frontend directory and install all with npm (being in frontend directory):
```
npm install
```

## Running the app
App can be used in 2 profiles: local and production.
Local has enabled prediction of bounding boxes, so it needs to have running backend with pretrained model. Production is just Angular creator app, prepared for standalone usage.

Run (being in frontend directory):
```
ng serve --c=production
```
OR
```
ng serve --c=local
```
Ignore warning of security if it's starting on local machine for local usage, not on some public server.
App would start at localhost:4200

## Building the app for deploy

If one want to deploy app on server, need to build it first.
To do it with particular configuration run the script (being in frontend directory):
```
ng build --configuration="production"
```
or
```
ng build --configuration="local"
```
It will create files for deploy in 'dist' directory
