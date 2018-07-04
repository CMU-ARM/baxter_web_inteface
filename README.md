# Baxter Web Interface
## Dependencies
```
sudo apt-get install ros-kinetic-web-video-server
```
## Usage
For camera functionality, first run in another terminal (before below server):
```
rosrun web_video_server web_video_server
```

To launch the server, run:
```
roslaunch rosbridge_server rosbridge_websocket.launch

```
You also need to serve the webpage itself through something like ```http-server```
