export class LoadingControllerMock {
  create: () => any;
  dismiss: () => any;
  present: () => any;

  constructor() {
    this.create = jest.fn(() => Promise.resolve());
    this.dismiss = jest.fn(() => Promise.resolve());
    this.present = jest.fn(() => Promise.resolve());
  }
}
