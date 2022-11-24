import { Component } from '@angular/core';
import * as activitystore from './activity.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {
    this.nextActivity()
  }
  title = 'test-store';

  readonly activity$ = activitystore.activity$

  // this reference to store has reactive properties
  readonly storeValue$ = activitystore.store;

  nextActivity() {
    activitystore.store.fetch("")
  }
  idle() {
    activitystore.store.mutate(prev=> prev.activity = "Idle")
  }
}
