import { eq } from "drizzle-orm";
import { db } from "./db";
import { posts, projects, type Post, type Project } from "./schema";

/**
 * Content storage service interface
 * Provides unified interface for storing and retrieving MDX content
 */
export interface ContentStorageService {
	/**
	 * Save MDX content for a post or project
	 */
	saveContent(
		id: string,
		mdxContent: string,
		type: "post" | "project",
	): Promise<void>;

	/**
	 * Get MDX content for a post or project
	 */
	getContent(id: string, type: "post" | "project"): Promise<string>;

	/**
	 * Delete content (cleanup storage-specific resources)
	 */
	deleteContent(id: string, type: "post" | "project"): Promise<void>;

	/**
	 * Migrate content to S3 storage
	 */
	migrateToS3(id: string, type: "post" | "project"): Promise<void>;

	/**
	 * Validate content before storage
	 */
	validateContent(mdxContent: string): Promise<ValidationResult>;
}

/**
 * Content validation result
 */
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Content storage error types
 */
export class ContentStorageError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly details?: any,
	) {
		super(message);
		this.name = "ContentStorageError";
	}
}

export class ContentNotFoundError extends ContentStorageError {
	constructor(id: string, type: string) {
		super(`Content not found: ${type}/${id}`, "CONTENT_NOT_FOUND", {
			id,
			type,
		});
	}
}

export class ContentValidationError extends ContentStorageError {
	constructor(errors: string[]) {
		super(
			`Content validation failed: ${errors.join(", ")}`,
			"VALIDATION_ERROR",
			{ errors },
		);
	}
}

export class StorageMigrationError extends ContentStorageError {
	constructor(message: string, details?: any) {
		super(message, "MIGRATION_ERROR", details);
	}
}

/**
 * Database content storage implementation
 * Stores MDX content directly in the database
 */
export class DatabaseContentStorage implements ContentStorageService {
	async saveContent(
		id: string,
		mdxContent: string,
		type: "post" | "project",
	): Promise<void> {
		try {
			// Validate content before saving
			const validation = await this.validateContent(mdxContent);
			if (!validation.isValid) {
				throw new ContentValidationError(validation.errors);
			}

			const table = type === "post" ? posts : projects;
			const updateData = {
				mdxContent,
				contentStorageType: "database" as const,
				updatedAt: new Date(),
			};

			const result = await db
				.update(table)
				.set(updateData)
				.where(eq(table.id, id))
				.returning({ id: table.id });

			if (result.length === 0) {
				throw new ContentNotFoundError(id, type);
			}
		} catch (error) {
			if (error instanceof ContentStorageError) {
				throw error;
			}
			throw new ContentStorageError(
				`Failed to save content: ${error.message}`,
				"SAVE_ERROR",
				{ id, type, originalError: error },
			);
		}
	}

	async getContent(id: string, type: "post" | "project"): Promise<string> {
		try {
			const table = type === "post" ? posts : projects;
			const record = await db
				.select({
					mdxContent: table.mdxContent,
					contentStorageType: table.contentStorageType,
				})
				.from(table)
				.where(eq(table.id, id))
				.limit(1);

			if (!record[0]) {
				throw new ContentNotFoundError(id, type);
			}

			// Ensure we're reading from the correct storage type
			if (record[0].contentStorageType !== "database") {
				throw new ContentStorageError(
					`Content is stored in ${record[0].contentStorageType}, not database`,
					"STORAGE_TYPE_MISMATCH",
					{ id, type, storageType: record[0].contentStorageType },
				);
			}

			if (!record[0].mdxContent) {
				throw new ContentStorageError(
					`Content is empty or null`,
					"EMPTY_CONTENT",
					{ id, type },
				);
			}

			return record[0].mdxContent;
		} catch (error) {
			if (error instanceof ContentStorageError) {
				throw error;
			}
			throw new ContentStorageError(
				`Failed to get content: ${error.message}`,
				"GET_ERROR",
				{ id, type, originalError: error },
			);
		}
	}

	async deleteContent(id: string, type: "post" | "project"): Promise<void> {
		// For database storage, content is deleted when the record is deleted
		// No additional cleanup needed
		return Promise.resolve();
	}

	async migrateToS3(id: string, type: "post" | "project"): Promise<void> {
		try {
			// Get current content
			const content = await this.getContent(id, type);

			// Create S3 storage service and save content
			const s3Storage = new S3ContentStorage();
			await s3Storage.saveContent(id, content, type);

			// Update database record to point to S3
			const table = type === "post" ? posts : projects;
			const s3Key = `${type}s/${id}.mdx`;
			const s3Url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Key}`;

			await db
				.update(table)
				.set({
					contentStorageType: "s3" as const,
					mdxContent: null, // Clear database content
					s3Key,
					s3Url,
					s3Bucket: process.env.S3_BUCKET,
					updatedAt: new Date(),
				})
				.where(eq(table.id, id));
		} catch (error) {
			throw new StorageMigrationError(
				`Failed to migrate content to S3: ${error.message}`,
				{ id, type, originalError: error },
			);
		}
	}

	async validateContent(mdxContent: string): Promise<ValidationResult> {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Basic validation
		if (!mdxContent || mdxContent.trim().length === 0) {
			errors.push("Content cannot be empty");
		}

		// Check for extremely large content (>10MB)
		const contentSize = Buffer.byteLength(mdxContent, "utf8");
		if (contentSize > 10 * 1024 * 1024) {
			errors.push("Content size exceeds 10MB limit");
		}

		// Check for basic MDX structure
		if (mdxContent.includes("```") && !mdxContent.match(/```[\s\S]*?```/)) {
			warnings.push("Unclosed code blocks detected");
		}

		// Check for frontmatter format
		if (mdxContent.startsWith("---")) {
			const frontmatterMatch = mdxContent.match(/^---\n([\s\S]*?)\n---/);
			if (!frontmatterMatch) {
				warnings.push("Invalid frontmatter format detected");
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}
}

/**
 * S3 content storage implementation (reserved for future expansion)
 * Stores MDX content in AWS S3
 */
export class S3ContentStorage implements ContentStorageService {
	private s3Client: any; // Will be AWS S3Client when implemented

	constructor() {
		// Initialize S3 client when AWS SDK is added
		// this.s3Client = new S3Client({
		//   region: process.env.AWS_REGION,
		//   credentials: {
		//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
		//   },
		// });
	}

	async saveContent(
		id: string,
		mdxContent: string,
		type: "post" | "project",
	): Promise<void> {
		try {
			// Validate content before saving
			const validation = await this.validateContent(mdxContent);
			if (!validation.isValid) {
				throw new ContentValidationError(validation.errors);
			}

			const key = `${type}s/${id}.mdx`;

			// TODO: Implement S3 upload when AWS SDK is added
			// await this.s3Client.send(new PutObjectCommand({
			//   Bucket: process.env.S3_BUCKET,
			//   Key: key,
			//   Body: mdxContent,
			//   ContentType: 'text/markdown',
			//   Metadata: {
			//     'content-type': type,
			//     'created-at': new Date().toISOString(),
			//   },
			// }));

			// For now, throw an error indicating S3 is not implemented
			throw new ContentStorageError(
				"S3 storage is not yet implemented. Please use database storage.",
				"S3_NOT_IMPLEMENTED",
				{ id, type },
			);
		} catch (error) {
			if (error instanceof ContentStorageError) {
				throw error;
			}
			throw new ContentStorageError(
				`Failed to save content to S3: ${error.message}`,
				"S3_SAVE_ERROR",
				{ id, type, originalError: error },
			);
		}
	}

	async getContent(id: string, type: "post" | "project"): Promise<string> {
		try {
			const key = `${type}s/${id}.mdx`;

			// TODO: Implement S3 download when AWS SDK is added
			// const response = await this.s3Client.send(new GetObjectCommand({
			//   Bucket: process.env.S3_BUCKET,
			//   Key: key,
			// }));
			// return await response.Body?.transformToString() || '';

			// For now, throw an error indicating S3 is not implemented
			throw new ContentStorageError(
				"S3 storage is not yet implemented. Please use database storage.",
				"S3_NOT_IMPLEMENTED",
				{ id, type },
			);
		} catch (error) {
			if (error instanceof ContentStorageError) {
				throw error;
			}
			throw new ContentStorageError(
				`Failed to get content from S3: ${error.message}`,
				"S3_GET_ERROR",
				{ id, type, originalError: error },
			);
		}
	}

	async deleteContent(id: string, type: "post" | "project"): Promise<void> {
		try {
			const key = `${type}s/${id}.mdx`;

			// TODO: Implement S3 delete when AWS SDK is added
			// await this.s3Client.send(new DeleteObjectCommand({
			//   Bucket: process.env.S3_BUCKET,
			//   Key: key,
			// }));

			// For now, just resolve - no actual deletion needed
			return Promise.resolve();
		} catch (error) {
			throw new ContentStorageError(
				`Failed to delete content from S3: ${error.message}`,
				"S3_DELETE_ERROR",
				{ id, type, originalError: error },
			);
		}
	}

	async migrateToS3(): Promise<void> {
		// S3 to S3 migration is not needed
		return Promise.resolve();
	}

	async validateContent(mdxContent: string): Promise<ValidationResult> {
		// Use the same validation logic as DatabaseContentStorage
		const databaseStorage = new DatabaseContentStorage();
		return databaseStorage.validateContent(mdxContent);
	}
}

/**
 * Content storage factory
 * Creates appropriate storage service based on configuration
 */
export class ContentStorageFactory {
	/**
	 * Create storage service by type
	 */
	static create(
		storageType: "database" | "s3" = "database",
	): ContentStorageService {
		switch (storageType) {
			case "s3":
				return new S3ContentStorage();
			case "database":
			default:
				return new DatabaseContentStorage();
		}
	}

	/**
	 * Create storage service based on record's storage type
	 */
	static createForRecord(record: {
		contentStorageType: string | null;
	}): ContentStorageService {
		const storageType = record.contentStorageType as "database" | "s3" | null;
		return this.create(storageType || "database");
	}

	/**
	 * Create storage service for a specific content item
	 */
	static async createForContent(
		id: string,
		type: "post" | "project",
	): Promise<ContentStorageService> {
		try {
			const table = type === "post" ? posts : projects;
			const record = await db
				.select({
					contentStorageType: table.contentStorageType,
				})
				.from(table)
				.where(eq(table.id, id))
				.limit(1);

			if (!record[0]) {
				throw new ContentNotFoundError(id, type);
			}

			return this.createForRecord(record[0]);
		} catch (error) {
			if (error instanceof ContentStorageError) {
				throw error;
			}
			throw new ContentStorageError(
				`Failed to determine storage type for content: ${error.message}`,
				"FACTORY_ERROR",
				{ id, type, originalError: error },
			);
		}
	}

	/**
	 * Get default storage type from environment or configuration
	 */
	static getDefaultStorageType(): "database" | "s3" {
		const envStorageType = process.env.DEFAULT_CONTENT_STORAGE_TYPE;
		if (envStorageType === "s3") {
			return "s3";
		}
		return "database";
	}

	/**
	 * Check if S3 storage is properly configured
	 */
	static isS3Configured(): boolean {
		return !!(
			process.env.AWS_REGION &&
			process.env.AWS_ACCESS_KEY_ID &&
			process.env.AWS_SECRET_ACCESS_KEY &&
			process.env.S3_BUCKET
		);
	}

	/**
	 * Validate storage configuration
	 */
	static validateStorageConfig(
		storageType: "database" | "s3",
	): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		if (storageType === "s3") {
			if (!this.isS3Configured()) {
				errors.push(
					"S3 storage is not properly configured. Missing environment variables.",
				);
			}
			warnings.push("S3 storage is not yet fully implemented.");
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}
}

/**
 * Utility functions for content storage operations
 */
export class ContentStorageUtils {
	/**
	 * Migrate content between storage types
	 */
	static async migrateContent(
		id: string,
		type: "post" | "project",
		fromStorage: "database" | "s3",
		toStorage: "database" | "s3",
	): Promise<void> {
		if (fromStorage === toStorage) {
			return; // No migration needed
		}

		try {
			const sourceStorage = ContentStorageFactory.create(fromStorage);
			const targetStorage = ContentStorageFactory.create(toStorage);

			// Get content from source
			const content = await sourceStorage.getContent(id, type);

			// Save to target
			await targetStorage.saveContent(id, content, type);

			// Update database record
			const table = type === "post" ? posts : projects;
			const updateData: any = {
				contentStorageType: toStorage,
				updatedAt: new Date(),
			};

			if (toStorage === "database") {
				// Moving to database - clear S3 fields
				updateData.s3Bucket = null;
				updateData.s3Key = null;
				updateData.s3Url = null;
			} else if (toStorage === "s3") {
				// Moving to S3 - clear database content and set S3 fields
				updateData.mdxContent = null;
				updateData.s3Bucket = process.env.S3_BUCKET;
				updateData.s3Key = `${type}s/${id}.mdx`;
				updateData.s3Url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${type}s/${id}.mdx`;
			}

			await db.update(table).set(updateData).where(eq(table.id, id));

			// Clean up source storage
			await sourceStorage.deleteContent(id, type);
		} catch (error) {
			throw new StorageMigrationError(
				`Failed to migrate content from ${fromStorage} to ${toStorage}: ${error.message}`,
				{ id, type, fromStorage, toStorage, originalError: error },
			);
		}
	}

	/**
	 * Batch migrate multiple content items
	 */
	static async batchMigrate(
		items: Array<{ id: string; type: "post" | "project" }>,
		toStorage: "database" | "s3",
		batchSize: number = 10,
	): Promise<{
		success: number;
		failed: Array<{ id: string; type: string; error: string }>;
	}> {
		const results = {
			success: 0,
			failed: [] as Array<{ id: string; type: string; error: string }>,
		};

		// Process in batches
		for (let i = 0; i < items.length; i += batchSize) {
			const batch = items.slice(i, i + batchSize);

			await Promise.allSettled(
				batch.map(async (item) => {
					try {
						// Determine current storage type
						const currentStorage = await ContentStorageFactory.createForContent(
							item.id,
							item.type,
						);
						const table = item.type === "post" ? posts : projects;
						const record = await db
							.select({ contentStorageType: table.contentStorageType })
							.from(table)
							.where(eq(table.id, item.id))
							.limit(1);

						const fromStorage =
							(record[0]?.contentStorageType as "database" | "s3") ||
							"database";

						await this.migrateContent(
							item.id,
							item.type,
							fromStorage,
							toStorage,
						);
						results.success++;
					} catch (error) {
						results.failed.push({
							id: item.id,
							type: item.type,
							error: error.message,
						});
					}
				}),
			);
		}

		return results;
	}

	/**
	 * Get storage statistics
	 */
	static async getStorageStats(): Promise<{
		database: { posts: number; projects: number };
		s3: { posts: number; projects: number };
		total: { posts: number; projects: number };
	}> {
		const [
			databasePosts,
			s3Posts,
			databaseProjects,
			s3Projects,
			totalPosts,
			totalProjects,
		] = await Promise.all([
			db
				.select({ count: posts.id })
				.from(posts)
				.where(eq(posts.contentStorageType, "database")),
			db
				.select({ count: posts.id })
				.from(posts)
				.where(eq(posts.contentStorageType, "s3")),
			db
				.select({ count: projects.id })
				.from(projects)
				.where(eq(projects.contentStorageType, "database")),
			db
				.select({ count: projects.id })
				.from(projects)
				.where(eq(projects.contentStorageType, "s3")),
			db.select({ count: posts.id }).from(posts),
			db.select({ count: projects.id }).from(projects),
		]);

		return {
			database: {
				posts: databasePosts.length,
				projects: databaseProjects.length,
			},
			s3: {
				posts: s3Posts.length,
				projects: s3Projects.length,
			},
			total: {
				posts: totalPosts.length,
				projects: totalProjects.length,
			},
		};
	}
}
