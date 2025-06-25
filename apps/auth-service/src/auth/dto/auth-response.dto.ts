export class AuthResponseDto {
  accessToken: string;

  constructor(token: string) {
    this.accessToken = token;
  }
}
