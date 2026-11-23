# Remote Job Finder

Search, filter and sort remote jobs from the Remotive public API.

## API credit
Job data from [Remotive](https://remotive.com) (https://remotive.com/api/remote-jobs).
Docs: https://github.com/remotive-com/remote-jobs-api
No API key or login is needed to use this app.

## Features
- Search by title, company or location
- Filter by category
- Sort by newest, title or company
- Clear error message with a retry button when the API is unavailable

## Run locally

    git clone https://github.com/mndayiragi-hub/remote-jobs-finder.git
    cd remote-jobs-finder
    python3 server.py

Open http://localhost:8000. `server.py` serves the app and proxies `/api/jobs` to Remotive with a 30 minute cache, because the API allows only a few requests per minute.

## Deployment (web-01 and web-02)
Both servers run Nginx. From the project folder:

    eval "$(ssh-agent -s)" && ssh-add ~/.ssh/school
    ./deploy.sh

`deploy.sh` copies `index.html`, `style.css` and `app.js` to `/var/www/remote-jobs-finder/` on each server and installs two Nginx files:
- `deploy/jobs-cache.conf` defines a 30 minute cache for API responses.
- `deploy/jobs.conf` serves the app at `/jobs/` and proxies `/api/jobs` to https://remotive.com/api/remote-jobs. If Remotive is down, Nginx serves the last cached copy.

Then it runs `nginx -t` and reloads Nginx. No API key is needed, so no secrets are stored in this repository.

## Load balancer (lb-01)
HAproxy on lb-01 listens on port 80 and distributes requests between web-01 and web-02 with the round robin algorithm:

    frontend http_front
        bind *:80
        mode http
        default_backend http_back

    backend http_back
        mode http
        balance roundrobin
        server 7361-web-01 18.133.237.34:80 check
        server 7361-web-02 35.178.28.140:80 check

Each web server adds an `X-Served-By` header with its hostname, so you can see which one answered:

    curl -sI http://18.132.13.111/jobs/ | grep -i x-served-by

Run it several times and the value alternates between `7361-web-01` and `7361-web-02`.

## Live site
http://18.132.13.111/jobs/

## Challenges
- The Remotive API limits how often it can be called, so API responses are cached in Nginx for 30 minutes on each server, and search, filter and sort run in the browser.
- The app is served under `/jobs/` so the root page of the servers keeps working for earlier projects.

## Credits
- Job data: [Remotive](https://remotive.com). API docs: https://github.com/remotive-com/remote-jobs-api. Every listing links back to its Remotive page.
