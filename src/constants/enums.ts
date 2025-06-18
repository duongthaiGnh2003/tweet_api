export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerificationToken
}

export enum ModeUploaldFile {
  single,
  mutyplite
}
export enum MediaType {
  Image,
  Video,
  HLS
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum EncodingStatus {
  Pending,
  Processing,
  Success,
  Failed
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TwiterCircle
}

export enum PeopleFollow {
  Anyone = '0',
  Following = '1'
}
