import { Store } from "src/store";


export interface Activity {
  activity: string;
  type:string;
  participants:number;
  price:number;
}

export const store = new Store<Activity>({
  initialValue: {} as Activity,
  fetcher: async (key: string)=> {
    const query = await fetch("https://www.boredapi.com/api/activity");
    const data = await query.json()
    return data
  }
})


export const activity$ = store.select(a=> a.activity)
