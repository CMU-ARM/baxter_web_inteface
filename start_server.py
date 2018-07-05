#!/usr/bin/env python

import SimpleHTTPServer
import SocketServer
import urllib
import urllib2
import os 
import rospkg
import socket

rospack = rospkg.RosPack()
os.chdir(rospack.get_path("baxter_web_inteface"))

# Variables
IP = socket.gethostbyname(socket.getfqdn())
PORT = 8081
URL = IP + ':' + str(PORT)
#URL = 'localhost:8081'

# Setup simple sever
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
httpd = SocketServer.TCPServer(("", PORT), Handler)
print "Serving at " + URL + "/main.html"
httpd.serve_forever()

