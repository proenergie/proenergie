import http.server
import socketserver
import os

# Port, auf dem der Server laufen soll
PORT = 8000

# Verzeichnis, in dem die HTML-Datei liegt (das aktuelle Verzeichnis)
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Klasse für den HTTP-Server
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

# Server starten
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server läuft auf http://localhost:{PORT}")
    print(f"Öffne deine HTML-Datei im Browser, z.B. http://localhost:{PORT}/deine_datei.html")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer wird beendet.")