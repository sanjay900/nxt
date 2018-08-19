General Architecture:

Providers:
* Bluetooth - Provides a basic bluetooth handler that emits device status events such as connect and disconnect, is the connection point to the bluetooth device
* NXTPacket - Provides the ability to send and receive packets on the NXT device
* Motor - Provides a simplified handler for communicating with the onboard nxt motor control application
* Sensor - Provides a simplified handler for recieving sensor information

Components:
* Status - The bluetooth status icon
* Chart - A chart.js chart wrapped in a component that provides an easy way to push values to a line graph
* Joystick - a nipplejs powered joystick with event wrapping 

Pages:
* About - Information about the NXT device
* FileUpload - Show information about a file upload that is in progress
* Keyboard - A onscreen keyboard that sends tones to the nxt device
* MotorGraph - A graph of a single motor with CSV export support
* SensorGraph - A graph of a single sensor with CSV export support
* MotorStatus - Simple status about all connected motors
* SensorStatus - Simple status about all connected sensors
* Main - A page that provides joystick and tilt controls to control the robot
* Settings - Configure details about the brick like the bluetooth device and motor config
* Tabs - the tabbed interface

Data:
* I2CRegister - Stores information about how to access I2C based sensors
* NXTFile - Provides the ability to write and read files to the NXT brick.
* DirectCommand / DirectCommandResponse / SystemCommand / SystemCommandResponse - 
provides look up tables to get information about commands to communicate with the NXT brick
* Packet + its children - Stores information required to construct a single packet / receive a single packet from the NXT device
* PacketFactory - Construct packets from raw information received over bluetooth
* UltrasonicSensorCommand - Stores look up tables required to communicate with an ultrasonic sensor
Others:
* Utils - Utility functions


