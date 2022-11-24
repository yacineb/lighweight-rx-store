import { Component } from '@angular/core';
import * as activitystore from './activity.store';
const { createApp } = require('vue/dist/vue.esm-bundler.js');

const VueComponent = createApp({
      data() {
        return {
          activity: {}
        }
      },
      created() {
        this.sub = activitystore.activity$.subscribe(ac=> {
          this.activity = ac
        })
      },
    beforeDestroy () {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    },
      template: `<span>VueJs component: <b>{{ activity }}</b></span>`,
    })

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {
    this.nextActivity()
  }

  ngOnInit() {
    VueComponent.mount('#vue-comp')
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
