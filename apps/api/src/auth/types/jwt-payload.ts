export interface JwtPayload {
  /** Claim registrada de subject: o id do usuário. */
  sub: string;
  email: string;
}
