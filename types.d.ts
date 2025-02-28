export interface IUser {
    id: string,
    email: string,
    name: string,
    description: string,
    avatar: string,
    created_at: Date;
    updated_at: Date;
    provider: 'google' | 'github' | 'email',
}

type userProvider = "email" | "github" | "google";