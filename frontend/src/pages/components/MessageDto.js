// src/models/MessageDto.js
export class MessageDto {
    constructor(isUser, isSuggested, content) {
      this.isUser = isUser;
      this.isSuggested = isSuggested;
      this.content = content;
    }
  }
  