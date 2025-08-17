import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
process.env.DATABASE_URL = ":memory:";

// Mock Next.js modules that might not be available in test environment
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		back: vi.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/",
}));

// Mock the database connection
vi.mock("./lib/db", () => ({
	db: {
		insert: vi.fn(),
		select: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}));
