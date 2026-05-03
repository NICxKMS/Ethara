import { createHmac, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import type { z } from "zod";
import { getDb } from "@/db";
import { sessions, type User, users } from "@/db/schema";
import { conflict, unauthorized } from "./http";
import type { loginSchema, signupSchema } from "./validation";

export const sessionCookieName = "ethara_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;
const passwordCost = 12;

export type PublicUser = Pick<
	User,
	"id" | "name" | "email" | "createdAt" | "updatedAt"
>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

function publicUser(user: User): PublicUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

function sessionSecret(): string {
	const secret = process.env.SESSION_SECRET;
	if (!secret && process.env.NODE_ENV === "production") {
		throw new Error("SESSION_SECRET is required in production");
	}

	return secret ?? "development-session-secret";
}

function hashToken(token: string): string {
	return createHmac("sha256", sessionSecret()).update(token).digest("hex");
}

async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(sessionCookieName, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		expires: expiresAt,
	});
}

async function clearSessionCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(sessionCookieName, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	});
}

async function createSession(userId: string): Promise<void> {
	const token = randomBytes(32).toString("base64url");
	const expiresAt = new Date(Date.now() + sessionDurationMs);

	await getDb()
		.insert(sessions)
		.values({
			userId,
			tokenHash: hashToken(token),
			expiresAt,
		});

	await setSessionCookie(token, expiresAt);
}

export async function signup(input: SignupInput): Promise<PublicUser> {
	const [existingUser] = await getDb()
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, input.email))
		.limit(1);
	if (existingUser) {
		conflict("Email is already registered.");
	}

	const passwordHash = await hash(input.password, passwordCost);
	const [createdUser] = await getDb()
		.insert(users)
		.values({ name: input.name, email: input.email, passwordHash })
		.returning();

	await createSession(createdUser.id);
	return publicUser(createdUser);
}

export async function login(input: LoginInput): Promise<PublicUser> {
	const [user] = await getDb()
		.select()
		.from(users)
		.where(eq(users.email, input.email))
		.limit(1);
	if (!user) {
		unauthorized("Invalid email or password");
	}

	const validPassword = await compare(input.password, user.passwordHash);
	if (!validPassword) {
		unauthorized("Invalid email or password");
	}

	await createSession(user.id);
	return publicUser(user);
}

export async function logout(): Promise<void> {
	const cookieStore = await cookies();
	const token = cookieStore.get(sessionCookieName)?.value;
	if (token) {
		await getDb()
			.delete(sessions)
			.where(eq(sessions.tokenHash, hashToken(token)));
	}

	await clearSessionCookie();
}

export async function getCurrentUser(): Promise<PublicUser | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(sessionCookieName)?.value;
	if (!token) {
		return null;
	}

	const [row] = await getDb()
		.select({ user: users })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(
			and(
				eq(sessions.tokenHash, hashToken(token)),
				gt(sessions.expiresAt, new Date()),
			),
		)
		.limit(1);

	return row ? publicUser(row.user) : null;
}

export async function requireCurrentUser(): Promise<PublicUser> {
	const user = await getCurrentUser();
	if (!user) {
		unauthorized();
	}

	return user;
}
