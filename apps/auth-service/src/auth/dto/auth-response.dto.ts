// export class AuthResponseDto {
//   accessToken: string;

//   constructor(token: string) {
//     this.accessToken = token;
//   }
// }

export class AuthResponseDto {
  accessToken: {
    id: string;
    email: string;
    name?: string | null;
    exp: number;
    jti: string;
  };

  constructor(data: AuthResponseDto) {
    Object.assign(this, data);
  }
}
