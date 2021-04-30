export class RouterStub {
  url = '';
  navigate(commands: any[], extras?: any) {}
  getCurrentNavigation() {
    return {
      extras: {
        state: {
          data: {
            vendorSKUs: [],
          },
        },
      },
    };
  }
}
