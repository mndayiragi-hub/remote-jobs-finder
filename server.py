#!/usr/bin/python3
"""Local server: serves the app and proxies /api/jobs with a 30 minute cache"""
import http.server
import time
import urllib.request

API = "https://remotive.com/api/remote-jobs"
TTL = 1800
cache = {"time": 0, "body": b""}


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?")[0] != "/api/jobs":
            return super().do_GET()
        if time.time() - cache["time"] > TTL:
            req = urllib.request.Request(
                API, headers={"User-Agent": "remote-job-finder student app"})
            try:
                with urllib.request.urlopen(req, timeout=10) as r:
                    cache["body"] = r.read()
                    cache["time"] = time.time()
            except Exception:
                if not cache["body"]:
                    self.send_error(502, "Upstream API unavailable")
                    return
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(cache["body"])


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
