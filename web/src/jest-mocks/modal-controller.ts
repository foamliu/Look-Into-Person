class ModalMock {
  dismiss: () => any;
  present: () => any;
  onDidDismiss: () => any;
  onWillDismiss: () => any;

  constructor(data?: any) {
    this.dismiss = jest.fn(() => Promise.resolve(this.onDidDismiss()));
    this.present = jest.fn(() => Promise.resolve());
    this.onWillDismiss = jest.fn(() => Promise.resolve());
    this.onDidDismiss = jest.fn(() => new Promise((resolve) => resolve(data)));
  }
}

export class ModalControllerMock {
  create: () => any;
  dismiss: () => any;
  modal = new ModalMock({ data: 'mockData' });

  constructor() {
    this.create = jest.fn(() => Promise.resolve(this.modal));
    this.dismiss = jest.fn(() => Promise.resolve());
  }
}
