import {HelloWorldStatus} from "./enums/hello-world-status.enum";

export interface HelloWorldInterface {
    id: string;
    organizationId: string;
    title: string;
    message: string;
    author?: string | null;
    status: HelloWorldStatus;
    createdAt?: string;
    updatedAt?: string | null;
}

export interface HelloWorldAnalyticsInterface {
    total: number;
    published: number;
    drafts: number;
    archived: number;
}

export interface CreateHelloWorldInterface {
    title: string;
    message: string;
    author?: string;
    status?: HelloWorldStatus;
}

export interface UpdateHelloWorldInterface {
    title?: string;
    message?: string;
    author?: string;
    status?: HelloWorldStatus;
}