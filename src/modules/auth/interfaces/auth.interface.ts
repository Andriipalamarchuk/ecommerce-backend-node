export interface ILogin {
  email: string;
  password: string;
}

export interface ICredentials extends Pick<ILogin, 'email' | 'password'> {
  id: number;
}

export interface IRegistrationCredentials
  extends Pick<ILogin, 'email' | 'password'> {
  name: string;
  surname: string;
}

export interface ILoginResult {
  userId: number;
  accessToken: string;
}
