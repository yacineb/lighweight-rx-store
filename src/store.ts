import produce, { Draft } from 'immer';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';


export type StoreUpdateChange<T> = {
  previousValue: T;
  currentValue: T;
  label?: string;
};

export type StoreOnUpdateFn<T> = (change: StoreUpdateChange<T>) => void;

export type StoreInitOptions<T, Key> = {
  initialValue: T;
  fetcher: (key: Key)=> Promise<T>
};

export type CommandOptions = {
  label?: string;
};


export class Store<T,Key = string> {
  private readonly valueSubject: BehaviorSubject<T>;
  private readonly storeUpdateChangeSubject: Subject<StoreUpdateChange<T>>;
  private readonly initialValue: T;
  private readonly fetcher: (key: Key)=> Promise<T>;


  constructor(initOptions: StoreInitOptions<T, Key>) {
    this.valueSubject = new BehaviorSubject(initOptions.initialValue);
    this.storeUpdateChangeSubject = new Subject<StoreUpdateChange<T>>();
    this.initialValue = initOptions.initialValue;
    this.fetcher = initOptions.fetcher
  }

  /** Changes feed of the value in the store */
  get valueChanges(): Observable<T> {
    return this.valueSubject.asObservable();
  }

  /** Latest observed value */
  get value(): T {
    return this.valueSubject.getValue();
  }

  /** Changes feed */
  get storeUpdateChanges(): Observable<StoreUpdateChange<T>> {
    return this.storeUpdateChangeSubject.asObservable();
  }

  // safely mutates the current state
  mutate(mutation: (previousState: Draft<T>) => void, options: CommandOptions = {}): void {
    const previousValue = this.valueSubject.getValue();
    const currentValue = produce(previousValue, (draft)=> {
      mutation(draft)
    });
    this.valueSubject.next(currentValue);
    this.storeUpdateChangeSubject.next({
      previousValue,
      currentValue,
      label: options.label,
    });
  }



  /** SELECT or get compted value from the data feed */
  select<V>(selectFn: (state: T) => V): Observable<V> {
    return this.valueSubject.pipe(map(selectFn), distinctUntilChanged());
  }

  /**
   * Reset to the initial value
   */
  reset(options: CommandOptions = { label: "RESET" }): void {
    this._setData(this.initialValue, options);
  }

  fetch(key: Key, reset: boolean = false) {
    if (reset) this.reset()

    this.fetcher(key).then(data => {
      this._setData(data, { label: "UPDATE"})
    }).catch()
  }

  // This method is for internal use only
  private _setData(value: T, options: CommandOptions = {}): void {
    const previousValue = this.valueSubject.getValue();
    this.valueSubject.next(value);
    this.storeUpdateChangeSubject.next({
      previousValue,
      currentValue: value,
      label: options.label,
    });
  }
}
