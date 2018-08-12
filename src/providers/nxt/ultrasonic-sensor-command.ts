export enum UltrasonicSensorCommand {
  OFF = 0x00,
  /**
   * In this mode the ultrasonic sensor will only make a new measurement every time the command byte is send to the sensor. The sensor will measure distances for up to 8 objects and save the
   distances within the “Read measurement byte 0 – 7”.
   * @type {number}
   */
  SINGLE_SHOT = 0x01,
  /**
   * This is the default mode, where the sensor continuously makes new measurement with the specified interval.
   * @type {number}
   */
  CONTINUOUS_MEASUREMENT = 0x02,
  /**
   * Within this mode the sensor will measure whether any other ultrasonic sensors are within the vicinity. With this information a program can evaluate when it is best to make a new
   measurement which will not conflict with other ultrasonic sensors.
   * @type {number}
   */
  EVENT_CAPTURE = 0x03,
  REQUEST_WARM_RESET = 0x04
}
