# Baxter Web Interface
## Dependencies
```
sudo apt-get install ros-kinetic-web-video-server
```
## Usage
To launch the server, run:
```
roslaunch rosbridge_server rosbridge_websocket.launch
```

To view the cameras, run in another terminal:
```
rosrun web_video_server web_video_server
```
You also need to serve the webpage itself through something like ```http-server```
