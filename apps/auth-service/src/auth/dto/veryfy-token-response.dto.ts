export class VerifyTokenResponseDto {
  id: string;
  email: string;
  constructor(data: VerifyTokenResponseDto) {
    Object.assign(this, data);
  }
}
