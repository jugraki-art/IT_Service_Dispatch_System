export class RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'it_guy';
  department?: string;
  phone: string;
  building?: string;
  floor?: string;
  room?: string;
  roleTitle?: string;
}
