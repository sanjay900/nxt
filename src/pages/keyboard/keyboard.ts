import {Component, OnInit} from '@angular/core';

import {NxtPacketProvider} from "../../providers/nxt/nxt-packet";
import {PlayTone} from "../../providers/nxt/packets/direct/play-tone";
import {File} from "@ionic-native/file";

import MidiPlayer from "midi-player-ts"


@Component({
  selector: 'keyboard',
  templateUrl: 'keyboard.html'
})
export class KeyboardPage implements OnInit {
  private pianoKeys: IPianoKey[];
  private active: Map<number, boolean> = new Map<number, boolean>();

  constructor(private nxt: NxtPacketProvider, private file: File) {

    this.pianoKeys = [
      {whiteKeyId: 16},
      {whiteKeyId: 18, blackKeyId: 17},
      {whiteKeyId: 20, blackKeyId: 19},
      {whiteKeyId: 21},
      {whiteKeyId: 23, blackKeyId: 22},
      {whiteKeyId: 25, blackKeyId: 24},
      {whiteKeyId: 27, blackKeyId: 26},
      {whiteKeyId: 28},
      {whiteKeyId: 30, blackKeyId: 29},
      {whiteKeyId: 32, blackKeyId: 31},
      {whiteKeyId: 33},
      {whiteKeyId: 35, blackKeyId: 34},
      {whiteKeyId: 37, blackKeyId: 36},
      {whiteKeyId: 39, blackKeyId: 38},
      {whiteKeyId: 40},
      {whiteKeyId: 42, blackKeyId: 41},
      {whiteKeyId: 44, blackKeyId: 43},
      {whiteKeyId: 45},
      {whiteKeyId: 47, blackKeyId: 46},
      {whiteKeyId: 49, blackKeyId: 48},
      {whiteKeyId: 51, blackKeyId: 50},
      {whiteKeyId: 52},
      {whiteKeyId: 54, blackKeyId: 53},
      {whiteKeyId: 56, blackKeyId: 55},
      {whiteKeyId: 57},
      {whiteKeyId: 59, blackKeyId: 58},
      {whiteKeyId: 61, blackKeyId: 60},
      {whiteKeyId: 63, blackKeyId: 62},
      {whiteKeyId: 64}
    ];
  }

  ngOnInit() {

  }

  keyPress(keyNumber: number) {
    //The equation below maps midi notes to their respective frequency
    let f: number = 27.5 * Math.pow(2, ((keyNumber + 21) / 12));
    this.nxt.writePacket(false, PlayTone.createPacket(f, 100));
    this.active.set(keyNumber, true);
  }

  keyRelease(keyNumber: number) {
    this.active.set(keyNumber, false);
  }

  playMario() {
    let nxt = this.nxt;
    var Player = new MidiPlayer.Player(function (event) {
      if (event.name != "Note on" || event.track != 3) {
        return;
      }
      console.log(event);
      let f: number = 27.5 * Math.pow(2, ((event.noteNumber - 21) / 12));
      nxt.writePacket(false, PlayTone.createPacket(f, 100));
    });
    this.file.readAsArrayBuffer(this.file.applicationDirectory, "www/assets/tetris.mid").then(buf => {
      console.log(buf);
      Player.loadArrayBuffer(buf);
      Player.play();
    }, err => console.log(err));

  }
}

export interface IPianoKey {
  whiteKeyId: number;
  blackKeyId?: number;
}
