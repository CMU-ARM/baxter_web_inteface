#!/usr/bin/env python

import SimpleHTTPServer
import SocketServer
import urllib
import urllib2
import os 
import rospkg
import rospy
import socket

rospack = rospkg.RosPack()
os.chdir(rospack.get_path("baxter_web_inteface"))
rospy.init_node("start_server")

# Variables
IP = socket.gethostbyname(socket.getfqdn())
PORT = 8081
URL = IP + ':' + str(PORT)

# Setup simple sever
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
httpd = SocketServer.TCPServer(("", PORT), Handler)
rospy.loginfo("Serving at " + URL + "/main.html")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
except Exception as e:
    rospy.logerr(e)

