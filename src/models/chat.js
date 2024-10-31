export default class Chat {
  constructor(creator, guest) {
    this.creator = creator;
    this.creator.messages = [];
    this.guest = guest;
    this.guest.messages = [];
  }
}
