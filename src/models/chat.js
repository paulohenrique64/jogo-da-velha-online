class chat {
  constructor(creator, guest) {
    this.creator = creator;
    this.guest = guest;
    this.creator.messages = [];
    this.guest.messages = [];
  }
}

export default chat;