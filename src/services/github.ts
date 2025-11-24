import { Octokit } from 'octokit';

export class GitHubService {
    private octokit: Octokit;
    private owner: string;
    private repo: string;

    constructor(token: string, owner: string, repo: string) {
        this.octokit = new Octokit({ auth: token });
        this.owner = owner;
        this.repo = repo;
    }

    async uploadImage(path: string, file: File, message: string = 'Upload image'): Promise<void> {
        const content = await this.fileToBase64(file);
        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Content = content.split(',')[1];

        let sha: string | undefined;
        try {
            const { data } = await this.octokit.rest.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path,
            });
            if (!Array.isArray(data)) {
                sha = data.sha;
            }
        } catch (e: any) {
            // File doesn't exist, which is fine
            if (e.status !== 404) {
                throw e;
            }
        }

        await this.octokit.rest.repos.createOrUpdateFileContents({
            owner: this.owner,
            repo: this.repo,
            path,
            message,
            content: base64Content,
            sha,
        });
    }

    async listFiles(path: string): Promise<any[]> {
        try {
            const { data } = await this.octokit.rest.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path,
            });
            return Array.isArray(data) ? data : [data];
        } catch (e: any) {
            if (e.status === 404) {
                return [];
            }
            throw e;
        }
    }

    async getFileContent(path: string): Promise<string> {
        const { data } = await this.octokit.rest.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            path,
        });

        if (Array.isArray(data) || !('content' in data)) {
            throw new Error('Path is a directory or has no content');
        }

        return data.content; // Base64 encoded content
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    }

    /**
     * List all available month directories in data/
     * Returns array of month strings like "2024-11", "2024-12"
     */
    async listAvailableMonths(): Promise<string[]> {
        try {
            const files = await this.listFiles('data');
            const months = files
                .filter(f => f.type === 'dir')
                .map(f => f.name)
                .filter(name => /^\d{4}-\d{2}$/.test(name)) // Match YYYY-MM format
                .sort()
                .reverse(); // Most recent first
            return months;
        } catch (e) {
            console.error('Error listing months:', e);
            return [];
        }
    }

    /**
     * List all sectors (images) available for a given month
     * Returns array of sector names like "Desk", "Bed"
     */
    async listSectorsForMonth(month: string): Promise<string[]> {
        try {
            const files = await this.listFiles(`data/${month}`);
            const sectors = files
                .filter(f => f.type === 'file' && f.name.endsWith('.jpg'))
                .map(f => f.name.replace('.jpg', ''));
            return sectors;
        } catch (e) {
            console.error(`Error listing sectors for ${month}:`, e);
            return [];
        }
    }
}
