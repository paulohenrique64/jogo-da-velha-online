class chat {
  constructor(creator, guest) {
    this.creator = creator;
    this.creator.messages = [];
    this.guest = guest;
    this.guest.messages = [];
  }
}

export default chat;