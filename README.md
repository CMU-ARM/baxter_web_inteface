# Baxter Web Interface
## Dependencies
### Basic Dependencies
```
sudo apt-get install ros-<distro>-rosbridge-suite ros-<distro>-web-video-server 
```

### Sound and Video
```
sudo apt-get install darkice icecast2
```

## Setup
You probably will need to change the IP address in redirect.py in order for the server to work. Also, the server needs to be run after the baxter.sh shell script is run, much like any other piece of code on baxter.

## Usage
To start the web interface, run:
```
roslaunch baxter_web_inteface interface.launch
```
