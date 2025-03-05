type userProvider = "email" | "github" | "google";

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

export interface IProjects {
    id: string;
    name: string;
    description: string;
    readme: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    closed: boolean;
}


