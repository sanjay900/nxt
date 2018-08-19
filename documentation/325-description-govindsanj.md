# SWEN325 Application Description - Sanjay Govind - 300383656

## Concept
### Description
This application gives the user the ability to control a Lego Mindstorms NXT based vehicle, and supports all available sensors for the Lego NXT 1.0 set. This application uses Bluetooth to communicate with the robot, and uses Serial as a communications layer, which is compatible with both Ionic and React Native.
![RC Car](https://lh3.googleusercontent.com/4Gs_KgEBcqNwVjkcykgoJrRXaWk54u9h9fXBIpCR7Dj7riv3dAysOs-BclvdlffytXRlR2ffIbRRihHM6uWJtdxuZVz4YHuwxTbHTttqzvVokUpwAHQGzqEv98OFNBHZt3_YM2HusiY8OovVxa6jtviqR5ix7IoicplxGiUm5EobyTpV90KaRQcRAVIGRWesCdZRz4LrSXSqqQ4bnOvZmi3phFc0HWC39EcTd1h4m1_blPMsbGKfF6_9luDyATL_b2ZmkyxXZdipyPJwlULVHa9xcMhGRIjb8EEH2SU7-pidJGvbTG3TfCDJo2I_LUKQavpILR6mLaiAY-dyrd0GYLsmMNQ4r8eXxtLMaUzoCaFjQsssB9wXEuOKfuyTXtzD8Ivp8-UgR51fHkWsDlS7Ut7xQ-h4H-pVwL2Jl1eyQXj8tnKz1KARejZaA6N666ZJUxEV6DfTr37QneoLHtIqcb3kQypeRKi-xfT1G7UvIgaPxGH1oGhz6cEOvdJ0TKE870yX3JkNZVkku5ytAbpb0queY5WaIc8gTlnXKmnRx30S04UHVcKvwYAwBhCYDyzU3dUm1gJycee36kGZ5KgGvohwPv7VyMs7UVdNUXU=w1250-h938-no)

## Features
### Configurable interface for controlling the vehicle
The home screen for this application will give the user to control the vehicle, with virtual joysticks, or optionally by tilting the device. The user should be presented with two joysticks that allow them to move the vehicle, with each having a different role dependant on if the user would like tank controls or to have steering and drive joysticks. The tilt interface should remain consistant however, and work by rotating left and right to turn, and tilting forward and backwards for moving forwards and backwards.

### A settings interface
The user needs to be able to configure settings, such as the ability to pick a bluetooth device, and configure the name of the NXT brick. This also gives the user the ability to specify what sensors are connected to what ports of the device, and what ports each motor is plugged into. The car type should also be speficied, as a robot could be either tank controlled or have pivoting wheels. The ability to specificy the role of each motor is also required. The interface should also give the user the ability to choose what unit sensors record in, such as DB vs DBA and centimeters vs inches.

### A sensor interface
The user needs to be able to see a simple feedback from all sensors at once, and this should be present on the home screen. This should show the user how far objects are from a connected distance sensor, or how loud the sound is to a connected sound sensor, or how dark / light a reflection is to a connected light sensor or if a touch sensor is pressed.

### More detailed interfaces for single sensors
The user should be able to see a detailed interface with sensor logging so they can track how the sensor outputs have changed over time. There should be a way to save this data to a format that can be easily read, such as a CSV file.

### Ability to play sounds out of the NXT speaker
The user should be able to play tones out of the NXT speaker, and should be able to choose what tone they would like to play. Possibly bring up a keyboard interface to allow the user to pick what tone they would like the play.

## Implementation
### External Resources
This application will be communicating with a robot, and this is used as its external resource.

### Timeframe
I anticipate that this app will take 15 hours of work to complete

### Team
I will be working alone on this project.