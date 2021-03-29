import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  lastlyClickedButtonId = '';

  constructor() {}
  ngOnInit(): void {}

  isLastlyClicked(buttonId: string): boolean {
    return this.lastlyClickedButtonId === buttonId;
  }

  changeLastlyClicked(event: any) {
    this.lastlyClickedButtonId = event.currentTarget.attributes.id.nodeValue;
  }
}
