//Function that creates the ROS Header
function getHeader(){
  var currentTime = new Date();
  var secs = Math.floor(currentTime.getTime()/1000);
  var nsecs = Math.round(1000000000*(currentTime.getTime()/1000-secs));
  header = {
    stamp : {
      secs: secs,
      nsecs : nsecs 
    },
    frame_id:''
  }
  return header 
}

//from http://stackoverflow.com/questions/11128700/create-a-ul-and-fill-it-based-on-a-passed-array
function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');

    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        name_node = document.createTextNode(array[i]["name"])
        name_node.className = ""
        item.appendChild(name_node);
        item.appendChild(document.createTextNode(array[i]["time"]));

        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

function makeTable(arr_obj){
  var table = document.createElement('TABLE');
  table.className = "table"

  for(var i = 0; i < arr_obj.length; i++){

      cur_row = table.insertRow(i)
      counter = 0;
      for( var key in arr_obj[i]){
        node = cur_row.insertCell(counter)
        node.innerHTML = arr_obj[i][key]
        counter += 1
      }
      // cur_row.insertCell()
      // cur_row.insertCell(arr_obj[i]["time"])
  }

  if(arr_obj.length >= 1){
    head = table.createTHead()
    row = head.insertRow(0)
    counter = 0
    for(var key in arr_obj[0]){
      node = row.insertCell(counter)
      node.innerHTML = key
      counter += 1
    }
  }
  return table
}

function makeTableFromObj(obj, header){
  var table = document.createElement('TABLE');
  table.className = "table"

  var i = 0 
  for(var key in obj){
      cur_row = table.insertRow(i)
      node = cur_row.insertCell(0)
      node.innerHTML = key;
      node = cur_row.insertCell(1)
      node.innerHTML = obj[key];
      i += 1
  }

  if(header){
    head = table.createTHead()
    row = head.insertRow(0)
    counter = 0
    for(var index in header){
      th = document.createElement('th');
      th.innerHTML = header[index]
      row.appendChild(th)
    }
  }
  return table
}

//http://stackoverflow.com/questions/1117916/merge-keys-array-and-values-array-into-an-object-in-javascript
function toObject(names, values) {
    var result = {};
    for (var i = 0; i < names.length; i++)
         result[names[i]] = values[i];
    return result;
}


function subscribe_to_topic(topic_name,topic_type,callback){
  var topic = new ROSLIB.Topic({
    ros:ros,
    name: topic_name,
    messageType: topic_type
  })
  topic.subscribe(callback)
}

//http://www.jacklmoore.com/notes/rounding-in-javascript/
function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

//https://stackoverflow.com/questions/5451445/how-to-display-image-with-javascript
function show_image(src, width, height, alt) {
    node = document.getElementById("pic")
    var img = new Image(width, height);
    img.src = src;
    img.alt = alt;

    while(node.firstChild){
      node.removeChild(node.firstChild)
    }
    node.appendChild(img)
}

pause = false

function display_endeffector_info(msg,id){
  if(!pause){
  for(var key in msg.pose.position){
    msg.pose.position[key] = round(msg.pose.position[key],4);
  }
  pos_table = makeTableFromObj(msg.pose.position)
  for(var key in msg.pose.orientation){
    msg.pose.orientation[key] = round(msg.pose.orientation[key],4);
  }
  ori_table = makeTableFromObj(msg.pose.orientation)

    node = document.getElementById(id)
    while(node.firstChild){
      node.removeChild(node.firstChild)
    }
    node.appendChild(document.createTextNode("Position"))
    node.appendChild(pos_table)
    node.appendChild(document.createTextNode("Orientation"))
    node.appendChild(ori_table)
  }
}

ip = location.host
console.log(ip)
enable_topic = null;
robot_status = false;
sonar_status = true;
sonar_enable_topic = null;
head_open = false;
left_open = false;
right_open = false;
mic = false;


function initialize(){
  document.getElementById('safety-status').className = 'label label-danger';
  document.getElementById('safety-status').innerHTML = 'Disabled';
  document.getElementById('flag-status').className = 'label label-success';
  document.getElementById('flag-status').innerHTML = 'Inactive';
  document.getElementById('mic-status').innerHTML = 'Inactive';
  
  subscribe_to_topic('/robot/joint_states','sensor_msgs/JointState',function(msg){
    if(!pause){
    var posObj = toObject(msg.name, msg.position)
    for(key in posObj){
      posObj[key] = round(posObj[key],5)
    }
    var table_obj = makeTableFromObj(posObj,["joint name", "joint value"])
    node = document.getElementById('joint_state')
    while(node.firstChild){
      node.removeChild(node.firstChild)
    }
    node.appendChild(table_obj)
    }
  })

  subscribe_to_topic('/robot/limb/left/endpoint_state','baxter_core_msgs/EndpointState',function(msg){
    display_endeffector_info(msg, "left_hand_state")
  })

  subscribe_to_topic('/robot/limb/right/endpoint_state','baxter_core_msgs/EndpointState',function(msg){
    display_endeffector_info(msg, "right_hand_state")
  })
  
  subscribe_to_topic('/safety','std_msgs/Bool',function(msg){
    if(msg && msg.data){
      document.getElementById('safety-status').className = 'label label-success';
      document.getElementById('safety-status').innerHTML = 'Running';
    }
    else{
      document.getElementById('safety-status').className = 'label label-danger';
      document.getElementById('safety-status').innerHTML = 'Disabled'; 
    }
  })

  subscribe_to_topic('/robot/state','baxter_core_msgs/AssemblyState',function(msg){
    if(msg.enabled){
      document.getElementById('robot-status').className = 'label label-success';
      document.getElementById('robot-status').innerHTML = 'Enabled';
      document.getElementById('enable_robot_btn').classList.add("active")
      robot_status = true
    }
    else if(msg.stopped && msg.estop_source == msg.ESTOP_SOURCE_USER){
      document.getElementById('robot-status').className = 'label label-danger';
      document.getElementById('robot-status').innerHTML = 'EStop Pressed';
      robot_status = false
    }
    else{
      document.getElementById('robot-status').className = 'label label-danger';
      document.getElementById('robot-status').innerHTML = 'Disabled'; 
      document.getElementById('enable_robot_btn').classList.remove('active')
      robot_status = false
    }
    
    if(msg.estop_button || msg.estop_source){
      document.getElementById('flag-status').className = 'label label-danger';
      document.getElementById('flag-status').innerHTML = 'Killing';
      document.getElementById('kill_robot_btn').classList.add("active")
    } 
    else{   
      document.getElementById('flag-status').className = 'label label-success';
      document.getElementById('flag-status').innerHTML = 'Inactive'; 
      document.getElementById('kill_robot_btn').classList.remove("active")
    }
  })

  subscribe_to_topic('/robot/sonar/head_sonar/sonars_enabled','std_msgs/UInt16',function(msg){
    if(msg.data != 0){
      document.getElementById('sonar-status').className = 'label label-success';
      document.getElementById('sonar-status').innerHTML = 'Enabled';
      document.getElementById('disable_sonar_btn').classList.remove("active")
      sonar_status = true
    }
    else{
      document.getElementById('sonar-status').className = 'label label-danger';
      document.getElementById('sonar-status').innerHTML = 'Disabled'; 
      document.getElementById('disable_sonar_btn').classList.add('active')
      sonar_status = false
    }
  })
/*  
   subscribe_to_topic('/audio/audio','audio_common_msgs/AudioData',function(msg){
    if(mic && msg){
      document.getElementById('mic-status').className = 'label label-success';
      document.getElementById('mic-status').innerHTML = 'Listening';
      document.getElementById('mic_btn').classList.remove("active")
    }
    else{
      document.getElementById('mic-status').className = 'label label-danger';
      document.getElementById('mic-status').innerHTML = 'Off'; 
      document.getElementById('mic_btn').classList.add('active')
    }
  })
*/
  sonar_enable_topic = new ROSLIB.Topic({
    ros: ros,
    name: "/robot/sonar/head_sonar/set_sonars_enabled",
    messageType: "std_msgs/UInt16"
  })

  enable_topic = new ROSLIB.Topic({
    ros: ros,
    name: "/robot/set_super_enable",
    messageType: "std_msgs/Bool"
  })
  
  kill_topic = new ROSLIB.Topic({
    ros: ros,
    name: "/robot/set_super_stop",
    messageType: "std_msgs/Empty"
  })
  
  reset_topic = new ROSLIB.Topic({
    ros: ros,
    name: "/robot/set_super_reset",
    messageType: "std_msgs/Empty"
  })
  
  imageTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/camera/image/compressed',
    messageType : 'sensor_msgs/CompressedImage'
  });
  
  camera_open = new ROSLIB.Service({
    ros: ros,
    name: "/cameras/open",
    messageType: "baxter_core_msgs/OpenCamera"
  })
  
  camera_close = new ROSLIB.Service({
    ros: ros,
    name: "/cameras/close",
    messageType: "baxter_core_msgs/CloseCamera"
  })
 
  camera_list = new ROSLIB.Service({
    ros: ros,
    name: '/cameras/list',
    serviceType: 'baxter_core_msgs/ListCameras'
  });
}

function btnClick(event){
    pause = !pause
}

function enableBtnClick(event){
  msg = {}
  if(robot_status){
    msg['data'] = false
  }
  else{
    msg['data'] = true
  }
  if(enable_topic){
    enable_topic.publish(msg)
  }
}

function disableSonarBtnClick(event){
  msg = {}
  if(sonar_status){
    msg['data'] = 0
  }
  else{
    msg['data'] = 4095
  }
  if(sonar_enable_topic){
    sonar_enable_topic.publish(msg)
  }
}

function disableRobotBtnClick(event){
  msg = {}
  if(kill_topic){
    kill_topic.publish(msg)
  }
}

function resetRobotBtnClick(event){
  msg = {}
  if(reset_topic){
    reset_topic.publish(msg)
  }
}

function micBtnClick(event){
    document.getElementById('mic-status').className = 'label label-success';
    document.getElementById('mic-status').innerHTML = 'Listening';
    document.getElementById('mic_btn').classList.remove("active")
    window.open('http://192.168.0.153:8888/mystream.mp3')
}

function showHeadCamClick(event){
    var head = 'head_camera'
    var request = new ROSLIB.ServiceRequest({})
    camera_list.callService(request, function(result) {
        if(!head_open){
            if(left_open){
                var close = new ROSLIB.ServiceRequest({
                        name: 'right_hand_camera'
                })
                camera_close.callService(close, function(result) {right_open = false})
            }
            else if(right_open){
                var close = new ROSLIB.ServiceRequest({
                        name: 'left_hand_camera'
                })
                camera_close.callService(close, function(result) {left_open = false})
            }
            else {
                for (var i = 0, size = result.cameras.length; i < size; i++){
                    var item = result.cameras[i]
                    if (item != head){
                        var close = new ROSLIB.ServiceRequest({
                            name: item
                        })
                        camera_close.callService(close, function(result) {})
                    }
                }
            }
            var open = new ROSLIB.ServiceRequest({
                name: head
            })
            
            camera_open.callService(open, function(result) {
                head_open = true
            })
        }
    }) 
    window.open('http://localhost:8080/stream_viewer?topic=/cameras/head_camera/image&invert=none', '_blank')
}

function showLeftCamClick(event){
    var left = 'left_hand_camera'
    var request = new ROSLIB.ServiceRequest({})
    camera_list.callService(request, function(result) {
        if(!left_open){
            if(head_open){
                var close = new ROSLIB.ServiceRequest({
                        name: 'right_hand_camera'
                })
                camera_close.callService(close, function(result) {right_open = false})
            }
            else if(right_open){
                var close = new ROSLIB.ServiceRequest({
                        name: 'head_camera'
                })
                camera_close.callService(close, function(result) {head_open = false})
            }
            else{
                for (var i = 0, size = result.cameras.length; i < size; i++){
                    var item = result.cameras[i]
                    if (item != left){
                        var close = new ROSLIB.ServiceRequest({
                            name: item
                        })
                        camera_close.callService(close, function(result) {})
                    }
                }
            }
            var open = new ROSLIB.ServiceRequest({
                name: left
            })
            camera_open.callService(open, function(result) {
                left_open = true
            })
        }
    }) 
    window.open('http://localhost:8080/stream_viewer?topic=/cameras/left_hand_camera/image&invert=none', '_blank')
}

function showRightCamClick(event){
    var right = 'right_hand_camera'
    var request = new ROSLIB.ServiceRequest({})
    camera_list.callService(request, function(result) {
        if(!right_open){
            if(left_open){
                var close = new ROSLIB.ServiceRequest({
                        name: 'head_camera'
                })
                camera_close.callService(close, function(result) {head_open = false})
            }
            else if(head_open){
                var close = new ROSLIB.ServiceRequest({
                        name: 'left_hand_camera'
                })
                camera_close.callService(close, function(result) {left_open = false})
            }
            else{
                for (var i = 0, size = result.cameras.length; i < size; i++){
                    var item = result.cameras[i]
                    if (item != right){
                        var close = new ROSLIB.ServiceRequest({
                            name: item
                        })
                        camera_close.callService(close, function(result) {})
                    }
                }
            }
            var open = new ROSLIB.ServiceRequest({
                name: right
            })
            camera_open.callService(open, function(result) {
                right_open = true
            })
        }
    }) 
    window.open('http://localhost:8080/stream_viewer?topic=/cameras/right_hand_camera/image&invert=none', '_blank')
}

document.getElementById('pause_btn').addEventListener('click',btnClick);
document.getElementById('enable_robot_btn').addEventListener('click',enableBtnClick);
document.getElementById('reset_robot_btn').addEventListener('click',resetRobotBtnClick);
document.getElementById('disable_sonar_btn').addEventListener('click',disableSonarBtnClick);
document.getElementById('connect_btn').addEventListener('click',restartConnectClick)
document.getElementById('kill_robot_btn').addEventListener('click',disableRobotBtnClick)
document.getElementById('head_cam_btn').addEventListener('click',showHeadCamClick)
document.getElementById('left_cam_btn').addEventListener('click',showLeftCamClick)
document.getElementById('right_cam_btn').addEventListener('click',showRightCamClick)
document.getElementById('mic_btn').addEventListener('click',micBtnClick);

ros = null
started = false;

function restartConnectClick(){

  console.log("hello");
  if(started){
    document.getElementById("server-status").className = "label label-danger";
    document.getElementById("server-status").innerHTML = "unknown";
    ros.close()
  }
  var ros_url = document.getElementById("ros-url").value
  ros = new ROSLIB.Ros({
    url : ros_url
  });

  ros.on('connection', function() {
    console.log('Connected to websocket server.');
    document.getElementById("server-status").className = "label label-success";
    document.getElementById("server-status").innerHTML = "connected";
    initialize();
  });

  ros.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
    document.getElementById("server-status").className = "label label-danger";
    document.getElementById("server-status").innerHTML = "failed";
    error_flag = true
  });

  ros.on('close', function() {
    if(!error_flag){
      document.getElementById("server-status").className = "label label-danger";
      document.getElementById("server-status").innerHTML = "Closed";      
    }
    console.log('Connection to websocket server closed.');
  });
  started = true
}

// Connecting to ROS
// -----------------

var ros_url = 'ws://192.168.0.153:9090'
document.getElementById("ros-url").value = ros_url
restartConnectClick()

// var ros_url = 'ws://192.168.1.50:9090'

// var ros = new ROSLIB.Ros({
//   //url : 'ws://192.168.1.50:9090'
//   //url : 'ws://128.2.176.13:9090'
//   url : ros_url
// });
// error_flag = false



// ros.on('connection', function() {
//   console.log('Connected to websocket server.');
//   document.getElementById("server-status").className = "label label-success";
//   document.getElementById("server-status").innerHTML = "connected";
//   initialize();

// });

// ros.on('error', function(error) {
//   console.log('Error connecting to websocket server: ', error);
//   document.getElementById("server-status").className = "label label-danger";
//   document.getElementById("server-status").innerHTML = "failed";
//   error_flag = true
// });

// ros.on('close', function() {
//   if(!error_flag){
//     document.getElementById("server-status").className = "label label-danger";
//     document.getElementById("server-status").innerHTML = "Closed";      
//   }
//   console.log('Connection to websocket server closed.');
// });


