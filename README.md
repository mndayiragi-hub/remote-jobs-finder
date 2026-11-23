# Remote Job Finder

Search, filter and sort remote jobs from the Remotive public API.

## API credit
Job data from [Remotive](https://remotive.com) (https://remotive.com/api/remote-jobs).
Docs: https://github.com/remotive-com/remote-jobs-api
No API key or login is needed to use this app.

## Load balancer (lb-01)
HAproxy on lb-01 listens on port 80 and distributes requests between web-01 and web-02 with the round robin algorithm:
Each web server adds an `X-Served-By` header with its hostname, so you can see which one answered:
Run it several times and the value alternates between `7361-web-01` and `7361-web-02`.

## Live site
http://18.132.13.111/jobs/

## Challenges
- The Remotive API limits how often it can be called, so API responses are cached in Nginx for 30 minutes on each server, and search, filter and sort run in the browser.
- The app is served under `/jobs/` so the root page of the servers keeps working for earlier projects.

## Credits
- Job data: [Remotive](https://remotive.com). API docs: https://github.com/remotive-com/remote-jobs-api. Every listing links back to its Remotive page.
