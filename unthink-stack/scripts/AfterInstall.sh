#/bin/bash
mkdir -p /data/express/prod

mv /data/express/temp /data/express/prod/$DEPLOYMENT_ID
ln -sfn /data/express/prod/$DEPLOYMENT_ID /data/express/prod/current

(cd /data/express/prod/current && npm install --production)
