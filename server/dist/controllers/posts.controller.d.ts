import { Request, Response } from 'express';
export declare function getPosts(req: Request, res: Response): Promise<void>;
export declare function getFeaturedPosts(_req: Request, res: Response): Promise<void>;
export declare function getPostBySlug(req: Request, res: Response): Promise<void>;
export declare function createPost(req: Request, res: Response): Promise<void>;
export declare function updatePost(req: Request, res: Response): Promise<void>;
export declare function deletePost(req: Request, res: Response): Promise<void>;
export declare function addPostMedia(req: Request, res: Response): Promise<void>;
export declare function deletePostMedia(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=posts.controller.d.ts.map