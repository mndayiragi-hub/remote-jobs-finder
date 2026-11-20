#!/usr/bin/env bash
# Deploys the Remote Job Finder to web-01 and web-02
KEY=~/.ssh/school
for HOST in 18.133.237.34 35.178.28.140; do
    echo "Deploying to $HOST"
    scp -i "$KEY" index.html style.css app.js deploy/jobs.conf \
        deploy/jobs-cache.conf "ubuntu@$HOST:~/"
    ssh -i "$KEY" "ubuntu@$HOST" 'bash -s' << 'REMOTE'
sudo mkdir -p /var/www/remote-jobs-finder
sudo cp ~/index.html ~/style.css ~/app.js /var/www/remote-jobs-finder/
sudo cp ~/jobs.conf /etc/nginx/snippets/jobs.conf
sudo cp ~/jobs-cache.conf /etc/nginx/conf.d/jobs-cache.conf
grep -q "snippets/jobs.conf" /etc/nginx/sites-available/default || \
    sudo sed -i '/server_name _;/a include /etc/nginx/snippets/jobs.conf;' \
    /etc/nginx/sites-available/default
sudo nginx -t && sudo service nginx reload
REMOTE
done
