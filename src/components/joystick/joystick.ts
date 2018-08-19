import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import nipplejs from 'nipplejs';

@Component({
  selector: 'joystick',
  templateUrl: 'joystick.html'
})
export class JoystickComponent implements OnInit, OnDestroy {

  @ViewChild('joystick') joystickDiv;
  @Input('lockX') lockX: boolean;
  @Input('lockY') lockY: boolean;
  @Input('position') position;
  @Input('color') color;
  @Input('mode') mode;
  @Output('move') move = new EventEmitter();
  @Output('end') end = new EventEmitter();
  private joystick;

  constructor() {
  }

  ngOnDestroy(): void {
    this.joystick.destroy();
  }

  ngOnInit(): void {
    let options = {
      zone: this.joystickDiv.nativeElement,
      mode: this.mode,
      position: this.position,
      color: this.color,
      lockX: this.lockX,
      lockY: this.lockY
    };

    this.joystick = nipplejs.create(options)[0];
    this.joystick.on("move", this.move.emit.bind(this.move));
    this.joystick.on("end", this.end.emit.bind(this.end));
  }

}
