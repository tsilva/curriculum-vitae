"""Serve the built public export for concurrent browser smoke tests."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class SmokeServer(ThreadingHTTPServer):
    # Several browsers load many chunks at once; the default backlog is too small.
    request_queue_size = 128


if __name__ == "__main__":
    directory = Path(__file__).resolve().parent.parent / "web" / "out"
    if not directory.is_dir():
        raise SystemExit("Build the web export before running smoke tests.")
    handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
    with SmokeServer(("127.0.0.1", 4173), handler) as server:
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
