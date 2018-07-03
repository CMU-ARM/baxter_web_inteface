# Baxter Web Interface
## Dependencies
```
sudo apt-get install ros-kinetic-web-video-server
sudo apt-get install ros-kinetic-audio-common
```
## Usage
To launch the server, run:
```
roslaunch rosbridge_server rosbridge_websocket.launch

```

For camera functionality, first run in another terminal (before above server):
```
rosrun web_video_server web_video_server
```
You also need to serve the webpage itself through something like ```http-server```
