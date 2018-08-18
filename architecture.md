General Architecture:

Providers:
* Bluetooth - Provides a basic bluetooth handler that emits device status events such as connect and disconnect, is the connection point to the bluetooth device
* NXTPacket - Provides the ability to send and receive packets on the NXT device
* NXTFile - Provides the ability to write and read files to the NXT brick.
* Motor - Provides a simplified handler for communicating with the onboard nxt motor control application
* Sensor - Provides a simplified handler for recieving sensor information
* Chart - Provides an easy way to create chart.js charts and push information to them

Components:
* Status - The bluetooth status icon

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

Others:
* Utils - Utility functions
