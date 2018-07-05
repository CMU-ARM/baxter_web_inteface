#!/usr/bin/env python
import os 

os.system("/etc/init.d/icecast2 start")
os.system("darkice -c ~/music/darkice.cfg")
