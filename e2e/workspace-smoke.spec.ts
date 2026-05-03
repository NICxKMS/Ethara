import { expect, test } from "@playwright/test";

test("authenticated project task workspace flow", async ({ page, request }) => {
	const stamp = Date.now();
	const ownerEmail = `owner-${stamp}@example.com`;
	const teammateEmail = `teammate-${stamp}@example.com`;
	const password = "StrongPass123";
	const projectName = `QA Project ${stamp}`;
	const taskTitle = `QA Task ${stamp}`;

	const teammateSignup = await request.post("/api/auth/signup", {
		data: {
			email: teammateEmail,
			name: "QA Teammate",
			password,
		},
	});
	expect(teammateSignup.status()).toBe(201);

	await page.goto("/signup");
	await page.getByRole("textbox", { name: "Full name" }).fill("QA Owner");
	await page.getByRole("textbox", { name: "Email" }).fill(ownerEmail);
	await page.getByRole("textbox", { name: "Password" }).fill(password);
	await page.getByRole("button", { name: "Create account" }).click();
	await expect(page).toHaveURL(/\/dashboard$/);

	await page.goto("/projects");
	await page.getByRole("textbox", { name: "Project name" }).fill(projectName);
	await page
		.getByRole("textbox", { name: "Description" })
		.fill("Smoke test project");
	await page.getByRole("button", { name: "Create project" }).click();
	await expect(
		page.getByRole("link", { name: new RegExp(projectName) }),
	).toBeVisible();

	await page.getByRole("link", { name: new RegExp(projectName) }).click();
	await expect(page.getByText(projectName)).toBeVisible();

	await page
		.getByRole("textbox", { name: "Registered user email" })
		.fill(teammateEmail);
	await page.getByRole("button", { name: "Add member" }).click();
	await expect(page.locator("li").filter({ hasText: teammateEmail })).toBeVisible();

	await page.getByRole("textbox", { name: "Task title" }).fill(taskTitle);
	await page
		.getByRole("textbox", { name: "Description" })
		.fill("Smoke task with assignee and due date");
	await page
		.getByLabel("Assignee")
		.selectOption({ label: `QA Teammate (${teammateEmail})` });
	await page.getByLabel("Due date").fill("2026-05-02");
	await page.getByRole("button", { name: "Create task" }).click();
	await expect(page.getByText(taskTitle)).toBeVisible();

	const taskCard = page.locator("article").filter({ hasText: taskTitle });
	await taskCard.getByLabel("Update status").selectOption("in_progress");
	await taskCard.getByRole("button", { name: "Save status" }).click();
	await expect(page.getByText(taskTitle)).toBeVisible();
	await expect(taskCard.getByLabel("Update status")).toHaveValue("in_progress");

	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(/\/login$/);
});
